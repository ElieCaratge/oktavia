const bcrypt = require('bcrypt');
const User = require("../models/user")

// Number of iterations of hash process
const hashTurn = 10;

/*
* Create and save a new user
*/
exports.create = (req, res, next) => {
    const newUser = new User({
        ...req.body
    });
    newUser.save()
        .then((data) => {
            res.status(201).send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the user.",
            });
        });
};


/*
* Find a single user with a userId
*/
exports.findOne = (req, res, next) => {
    User.findById(req.params.userId)
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            res.send(data);
        })
        .catch((err) => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            return res.status(500).send({
                message: "Error retrieving user with id " + req.params.userId
            });
        });
};


/*
* Collect all users from the database
*/
exports.findAll = (req, res, next) => {
    User.find()
        .then((data) => {
            res.status(200).send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while collecting users."
            })
        });
};


/*
* Update a user identified by his userId
*/
exports.update = (req, res, next) => {
    User.findByIdAndUpdate(
        req.params.userId,
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        },
        { new: true }
    )
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            res.status(200).send(data);
        })
        .catch((err) => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            return res.status(500).send({
                message: "Error updating user with id " + req.params.userId,
            });
        });
};


/*
* Delete a user with the specified userId in the request
*/
exports.delete = (req, res, next) => {
    User.findByIdAndRemove(req.params.userId)
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            res.status(204).send({ message: "User deleted successfully!" });
        })
        .catch((err) => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            return res.status(500).send({
                message: "Could not delete user with id " + req.params.userId,
            });
        });
};


/*
* Delete all users from the database
*/
exports.deleteAll = (req, res, next) => {
    User.deleteMany()
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "No user found in database!",
                });
            }
            res.status(204).send({ message: "All users deleted successfully!"});
        })
        .catch((err) => {
            return res.status(500).send({
                message:
                    err.message || "Could not delete users!",
            });
        });
};


/*
* Signup user
*/
exports.signUp = (req, res, next) => {
    bcrypt.hash(req.body.password, hashTurn)
        .then( hash => {
            req.body.password = hash;
            const newUser = new User({
                ...req.body
            });
            newUser.save()
                .then((data) => {
                    res.status(201).send(data);
                })
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the user.",
                    });
                });
            })
        .catch( (error) => {
            res.status(500).json({error});
        });
};


/*
* Login user
*/
exports.signIn = (req, res, next) => {
    next();
};
