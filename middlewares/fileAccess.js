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
// TODO: Adapter cette méthode en asynchrone
// TODO: Tester cette méthode en partant de la route share.
const canReadMiddleware = async (req, res, next) => {
    if (!req.body.files) {
        return res.status(404).send({message: "Invalid request for middleware. Please put your files id in req.body.files."});
    } else {
        for (const fileId of req.body.files) {

            // VERSION ASYNCHRONE
            // TODO : faire cette version (plus efficace).
            // canRead(fileId, req.userId)
            //     .catch((err) => {
            //         return res.status(404).send({message: err.message || `Error while checking user access for file ${fileId}`});
            //     })
            //     .then((accessRight) => {
            //         if (!accessRight) {
            //             return res.status(404).send({message: `User ${req.userId} have no access to file ${fileId}`});
            //         }
            //     });

            //    VERSION SYNCHRONE
            try {
                const accessRight = await canRead(fileId, req.auth.userId)
                if (!accessRight) {
                    return res.status(404).send({message: `User ${req.auth.userId} have no access to file ${fileId}`});
                }
            } catch (err) {
                return res.status(404).send({message: err.message || `Error while checking user access for file ${fileId}`});
            }
        }
        next();
    }
}

module.exports = {canRead, canReadMiddleware};
