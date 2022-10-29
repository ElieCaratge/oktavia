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


/*
* Delete a file with the specified fileId in the request
*/
const deleteOne = (req, res, next) => {
    // Source: https://www.geeksforgeeks.org/mongoose-findbyidandremove-function/
    File.findByIdAndRemove(req.params.fileId, (err, docs) => {
        if (err) {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            return res.status(500).send({
                message: "Could not delete file with id " + req.params.fileId,
            });
        }
        // Source: https://www.bezkoder.com/node-js-delete-file/
        fs.unlink(path.join(__dirname, '..', 'files', docs.filename), (err) => {
                if (err) {
                    res.status(500).send({message: `Unable to delete file ${docs.url}`});
                }
                res.status(204).send({ message: "File deleted successfully!" });
            });
    });
    return next();
};


/*
* Delete all files from the database. Use it carefully.
*/
const deleteAll = (req, res, next) => {
    File.deleteMany((err, docs) => {
        if (err) {
            return res.status(500).send({
                message:
                    err.message || "Could not delete files!",
            });
        } else {
            if (!docs) {
                return res.status(404).send({
                    message: "No file found in database!",
                });
            }
            fs.readdir(path.join(__dirname, '..', 'files'), (err, files) => {
                files.forEach(
                    (file) => {
                        try {
                            fs.unlinkSync(path.join(__dirname, '..', 'files', file));
                        } catch (err) {
                            if (err) {
                                return res.status(500).send({message: `Unable to delete file ${file}`});
                            }
                        }
                    }
                )
                res.status(200).send({message: "Files removed successfully !"});
                return next();
            });
        }
    })
};


/*
* Delete several files using a filter.
* @param {Object} req.body.filter Filter used to find files and remove them.
* */
const deleteMany = (req, res, next) => {
    // TODO: req.body.filter est-il le bon argument ?
    if (!req.body.filter) {
        return res.status(400).send({message: 'Please check your filter.'})
    }
    File.find(req.body.filter, (err, docs) => {
        if (err) {
            return res.status(500).send({message: err.message || 'Error while retrieving files.'});
        }
        for (const doc in docs) {
            // TODO: remove duplicate code fragments
            File.findOneAndDelete(doc._id, (err, docs) => {
                if (err) {
                    if (err.kind === "ObjectId" || err.name === "NotFound") {
                        return res.status(404).send({
                            message: "File not found with id " + req.params.fileId,
                        });
                    }
                    return res.status(500).send({
                        message: "Could not delete file with id " + req.params.fileId,
                    });
                }
                fs.unlink(path.join(__dirname, '..', 'files', docs.filename), (err) => {
                    if (err) {
                        res.status(500).send({message: `Unable to delete file ${docs.url}`});
                    }
                    res.status(204).send({ message: "File deleted successfully!" });
                });
            });
        }
    });
    return next();
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
    for (const fileKey in req.body.files) {
        for (const userKey in req.body.users) {
            // Source: https://www.bezkoder.com/mongodb-many-to-many-mongoose/
            File.findByIdAndUpdate(
                fileKey,
                { $addToSet: {users: userKey}}
            )
                .catch((err) => {
                    // TODO: Faut-il arrêter le process ou passer à la suite ?
                    return res.status(500).send({
                        message:
                            err.message || `Could not update the file ${fileKey} when adding user ${userKey}!`,
                    })
                });
            User.findByIdAndUpdate(
                userKey,
                { $addToSet: {files: fileKey}}
            )
                .catch((err) => {
                    return res.status(500).send({
                        message:
                            err.message || `Could not update the user ${userKey} when adding the file ${fileKey}!`,
                    })
                });
        }
    }
    res.status(200).send({ message: 'Successfully updated users access !' });
    next();
}


const share = (req, res, next) => {
    req.body.users = [req.body.user]
    giveAccess(req, res, next);
}


module.exports = { create, giveAccess, findAll, deleteOne, deleteAll, share };
