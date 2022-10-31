const { User } = require('../models');
const {resolveAsyncConfigs} = require("config/async");


/* Check if User with userId can read file with fileId.
* @param {String} fileId id of the file to check
* @param {String} userId id of the user to check
* */
const canRead = async (fileId, userId) => {
    return new Promise(function (resolve, reject) {
        User.findById(userId)
            .catch((err) => {
                reject(err);
            })
            .then((data) => {
                if (!data){
                    reject({message: `User not found with id ${userId}.`});
                } else if (!data.files) {
                    reject({message: `User with id ${userId} has no 'files' field !`});
                }
                const res = data.files.map(objectId => objectId.toString());
                resolve(res.includes(fileId));
            })
    });
}


/* Middleware to check if the current user has access to a group of files.
* This middleware only removes from the list the ids the user has not access to.
* @param {Array} req.body.files List of the id of the files we have to check access
* */
const canReadMiddleware = (req, res, next) => {
    if (!req.body.files) {
        return res.status(404).send({message: "Invalid request for middleware. Please put your files id in req.body.files."});
    }

    let asyncRequests = [];
    for (const fileId of req.body.files) {
        asyncRequests.push(
            canRead(fileId, req.auth.userId)
                .catch((err) => {
                    throw new Error(err.message || `Error while checking user access for file ${fileId}`)
                })
                .then((accessRight) => {
                    if (accessRight===false) {
                        throw new Error(`User ${req.auth.userId} have no access to file ${fileId}`);
                    }
                })
        );
    }
    Promise.all(asyncRequests)
        .then(() => {
            next();
        })
        .catch((err) => {
            return res.status(404).send({message: err.message});
        })
}

module.exports = {canRead, canReadMiddleware};
