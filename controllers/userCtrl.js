const bcrypt = require('bcrypt');
const { User } = require("../models");
const jwt = require('jsonwebtoken');

// Number of iterations of hash process
const hashTurn = 10;

/*
* Create and save a new user
*/
const create = (req, res, next) => {

    // Check if request body is ok.
    if (!req.body || !(req.body instanceof Object)) {
        res.status(400).send({
            message: "Invalid request. req.body must be of type Object."
            });
    }

    // Creating data
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });
    newUser.save()
        .then((data) => {
            res.status(201).send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the user.",
                body: this
            });
        });
};


/*
* Find a single user with a userId
*/
const findOne = (req, res, next) => {
    User.findById(req.params.userId)
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId,
                });
            }
            res.status(200).send(data);
            return next();
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
const findAll = (req, res, next) => {
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
const update = (req, res, next) => {
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
const deleteOne = (req, res, next) => {
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
const deleteAll = (req, res, next) => {
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
const signUp = (req, res, next) => {
    bcrypt.hash(req.body.password, hashTurn)
        .then( hash => {
            req.body.password = hash;
            create(req, res, next);
        })
        .catch( (error) => {
            res.status(500).json({error});
        });
};


/*
* Login user
*/
const signIn = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(401).send({message: "email ou mot de passe incorrect !"});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'email ou mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }))
};


/*
* Exporting controller functions
* */
module.exports = {
    create,
    findOne,
    findAll,
    update,
    deleteOne,
    deleteAll,
    signUp,
    signIn
};
