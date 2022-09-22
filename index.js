'use strict';

const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

// Constants
const PORT = 8080;
const HOST = '127.0.0.1';

// App
const app = express();

// Database
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

// Routes
app.get('/', (req, res) => {
    res.send("Hello World !");
});

// Server
app.listen(PORT, HOST, () => {
        console.log(`Running on http://${HOST}:${PORT}`);
    })
