const fs = require('file-system');
const { File } = require("../models");

/*
* Create and save a new file
*/
const create = (req, res, next) => {

    const fileObject = JSON.parse(req.body.file);
    delete fileObject._id;
    delete fileObject._userId;


    // Creating data
    const newFile = new File({
        ...fileObject,
        userId: req.auth.userId,
        url: `${req.protocol}://${req.hostname}/files/${req.file.name}`
    });
    newFile.save()
        .then((data) => {
            res.status(201).send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the file.",
                body: this
            });
        });
};


/*
* Find a single file with a fileId
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
    File.findByIdAndRemove(req.params.fileId)
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            res.status(204).send({ message: "File deleted successfully!" });
        })
        .catch((err) => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    message: "File not found with id " + req.params.fileId,
                });
            }
            return res.status(500).send({
                message: "Could not delete file with id " + req.params.fileId,
            });
        });
};


/*
* Delete all files from the database
*/
const deleteAll = (req, res, next) => {
    File.deleteMany()
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "No file found in database!",
                });
            }
            res.status(204).send({ message: "All files deleted successfully!"});
        })
        .catch((err) => {
            return res.status(500).send({
                message:
                    err.message || "Could not delete files!",
            });
        });
};


module.exports = { create };
