const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const {userRouter} = require("./routes");
const bodyParser = require('body-parser');

/*
* App
*/
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
* Database
*/
mongoose.Promise = global.Promise;
const connexionString = "mongodb+srv://"
    +config.get("dbConfig").user
    +":"+config.get("dbConfig").password
    +"@"+config.get("dbConfig").host
    +"/?retryWrites=true&w=majority"
mongoose.connect(connexionString, { useNewUrlParser: true })
    .then(() => { console.log("Successfully connected to the database"); })
    .catch((err) => {
        console.log("Could not connect to the database. Error...\n", err);
        process.exit();
    });

/*
* Routes
*/
app.get('/', (req, res) => { res.send("Hello World !"); });
app.use('/user', userRouter)

module.exports = app;
