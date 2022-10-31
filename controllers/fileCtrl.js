const fs = require('fs');
const path = require('path');
const { File, User } = require("../models");

/*
* Create and save a new file
*/
const create = (req, res, next) => {

    // Creating data
    const newFile = new File({
        contentType: req.file.mimetype,
        userId: req.auth.userId,
        url: `${req.protocol}://${req.hostname}/files/${req.file.filename}`,
        users: [req.auth.userId]
    });
    newFile.save()
        .then((file) => {
            User.findByIdAndUpdate(req.auth.userId, {
                $addToSet: {files: file._id}
            })
                .then((user) => {
                    res.status(201).send(file);
                })
                .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the file."
                    })
                })
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the file."
            });
        });
};


/*
* Find a single file with a fileId
* @param {String} req.params.fileId Id of the file to find.
*/
const findOne = (req, res, next) => {
    File.findById(req.params.fileId)
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            res.status(200).send(data);
        })
        .catch((err) => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            return res.status(500).send({
                message: "Error retrieving file with id " + req.params.fileId
            });
        });
};


/*
* Collect all files from the database
*/
const findAll = (req, res, next) => {
    File.find()
        .then((data) => {
            res.status(200).send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while collecting files."
            })
        });
};


/*
* To get all the files the current user has access to. (Requires authentification)
* */
const getFilesByUser = (req, res, next) => {
    User.findById(req.auth.userId).populate('files')
        .then((data) => {
                res.status(200).send(data.files);
                next();
            }
        )
        .catch((err) => {
            res.status(500).send({message: err.message || 'Error while retrieving files from current user.'});
        });
}


/*
* Update a file identified by his fileId
*/
const update = (req, res, next) => {
    File.findByIdAndUpdate(
        req.params.fileId,
        {
            contentType: req.body.contentType,
            userId: req.body.userId,
            url: req.body.url
        },
        { new: true }
    )
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            res.status(200).send(data);
        })
        .catch((err) => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            return res.status(500).send({
                message: "Error updating file with id " + req.params.fileId,
            });
        });
};


/* Intermediate function to delete a single file. It is both used in deleteOne and deleteMany methods.
* @param {String} fileId Id of the file to delete.
* */
const deleteOneFunction = async (fileId, userId, soft=true) => {
    // Source: https://www.geeksforgeeks.org/mongoose-findbyidandremove-function/
    // Removing the File object in database.
    try {
        if (soft) {
            const file = await File.findById(fileId);
            if (file.users.length > 1) {
                let asyncRequests = [
                    User.findByIdAndUpdate(userId, {$pull: {files: file._id}}),
                    File.findByIdAndUpdate(fileId, {$pull: {users: userId}})
                ]
                await Promise.all(asyncRequests);
            } else {
                await deleteOneFunction(fileId, false);
            }
        } else {
            const docs = await File.findByIdAndRemove(fileId)
                .then((docs) => {
                    // Checking docs are not null.
                    if (docs === null) {
                        let err = new Error("");
                        err.name = "NotFound";
                        throw err;
                    }
                    return docs;
                });
            // Then removing all its references
            await User.updateMany({_id: {$in: docs.users}}, {$pull: {files: docs._id}});
            // Finally, removing the file on the server.
            // Source: https://www.bezkoder.com/node-js-delete-file/
            fs.unlinkSync(path.join(__dirname, '..', 'files', docs.filename));
        }
    } catch (err) {
        throw err;
    }
}


/*
* Delete a file with the specified fileId in the request.
* */
const deleteOne = (req, res, next) => {
    deleteOneFunction(req.params.fileId, req.auth.userId, req.body.soft || true)
        .then(() => {
            res.status(200).send({ message: "File deleted successfully!" });
            next();
        })
        .catch((err) => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            return res.status(500).send({
                message: err.message || "Could not delete file with id " + req.params.fileId,
            });
        });
};


/*
* Delete all files from the database. Use it carefully.
* */
const deleteAll = (req, res, next) => {
    let asyncRequests = [];
    asyncRequests.push(File.deleteMany().catch((err) => {throw {err: err, type: "mongoose.File"}}));
    asyncRequests.push(User.updateMany({}, {files: []}).catch((err) => {throw {err: err, type: "mongoose.User"}}));
    async function deleteFiles(){
        try {
            const files = fs.readdirSync(path.join(__dirname, '..', 'files'));
            files.forEach(
                (file) => {
                    try {
                        fs.unlinkSync(path.join(__dirname, '..', 'files', file));
                    } catch (err) {
                        if (err) {
                            throw {err: err, type: "server", file: file};
                        }
                    }
                }
            );
        } catch (err) {
            throw {err: err, type: "server"};
        }
    }
    asyncRequests.push(deleteFiles());

    Promise.all(asyncRequests)
        .then(() => {
            res.status(200).send({message: "Files removed successfully !"});
            return next();
        })
        .catch((err) => {
            if (err.type==="mongoose.File") {
                return res.status(500).send({message: err.err.message || "Error while removing files in mongoDB."});
            } else if (err.type==="mongoose.User") {
                return res.status(500).send({message: err.err.message || "Error while updating users in mongoDB."});
            } else if (err.type==="server" && err.file) {
                return res.status(500).send({message: `Unable to delete file with id ${err.file}`})
            } else if (err.type==="server" && !err.file) {
                return res.status(500).send({message: err.err.message || "Unable to delete files from the server."})
            } else {
                return res.status(500).send({message: err.message || "Error while removing files from the server."})
            }
        })
};


/*
* Delete several files using a filter.
* @param {Array} req.body.files List of files to remove.
* */
const deleteMany = (req, res, next) => {
    if (req.body.files.length === 0){
        deleteFilesByUser(req, res, next);
    } else {
        let asyncRequests = []
        for (const file of req.body.files) {
            asyncRequests.push(deleteOneFunction(file, req.auth.userId, req.body.soft || true));
        }
        Promise.all(asyncRequests)
            .then(() => {
                res.status(200).send({message: "Files deleted successfully !"});
                next();
            })
            .catch((err) => {
                if (err.kind === "ObjectId" || err.name === "NotFound") {
                    return res.status(404).send({
                        message: err.message || "File not found."
                    });
                }
                return res.status(500).send({
                    message: err.message || "Could not delete some file."
                });
            });
    }
}


/*
* Delete all the files the current user has access to.
* */
const deleteFilesByUser = (req, res, next) => {
    User.findById(req.auth.userId)
        .then((user) => {
            File.deleteMany({_id: {$in: user.files}})
                .then(() => {res.status(200).send({message: "Successfully removed all user's file !"})})
                .catch((err) => {return res.status(500).send({message: err.message || "Error while removing all user's file."});})
        })
        .catch((err) => {
            return res.status(500).send({message: err.message || "Error while retrieving all user's file."});
        })
}


/*
* Main method to give several users access to several files.
* @param {Array} req.body.users List of ids of users who get the access.
* @param {Array} req.body.files List of ids of files to give them access to.
* */
const giveAccess = (req, res, next) => {
    // Checking the request arguments
    if (!req.body.users
        || !req.body.files
        || !(req.body.users instanceof Array)
        || !(req.body.files instanceof Array)
    ) {
        res.status(404)
            .send({
                message: 'Invalid req.body format. Please make sure it matches {users: [], files: []} pattern'
            });
    }

    let asyncRequests = [];

    for (const userKey of req.body.users) {
        asyncRequests.push(
            User.findByIdAndUpdate(
                userKey,
                // https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/#-each-modifier
                { $addToSet: {files: { $each : req.body.files }}}
            )
        );
    }
    for (const fileKey of req.body.files) {
        // Source: https://www.bezkoder.com/mongodb-many-to-many-mongoose/
        asyncRequests.push(
            File.findByIdAndUpdate(
                fileKey,
                { $addToSet: { users: { $each: req.body.users }}}
            )
        );
    }
    Promise.all(asyncRequests)
        .then(() => {
            res.status(200).send({ message: 'Successfully updated users access !' });
            next();
        })
        .catch((err) => {
        return res.status(500).send({
            message:
                err.message || `Could not update file and users access !`
        })
    })
}


/* To give access to several files to a single user.
* @param {String} req.body.user Id of the user to share the files to. This argument has priority over req.body.users.
* @param {Array} req.body.users List of Ids of users to share the files to.
* @param {String} req.body.files The files to share.
* */
const share = (req, res, next) => {
    if (req.body.user) {
        delete req.body.users;
        req.body.users = [req.body.user];
    }
    giveAccess(req, res, next);
}


module.exports = { create, giveAccess, findOne, findAll, getFilesByUser, deleteOne, deleteAll, deleteMany, deleteFilesByUser, share };
