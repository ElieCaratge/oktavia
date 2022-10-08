const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const fileSchema = new mongoose.Schema({
    contentType: {type: String, required: true},
    url: {type: String, required: true},
    // Utilisateur ayant uploadé le fichier, pour retrouver l'origine
    userId: {type: String, required: true},
});

module.exports = mongoose.model("File", fileSchema);
