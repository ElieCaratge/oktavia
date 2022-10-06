const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const fileSchema = new mongoose.Schema({
    contentType: {type: String, required: true},
    image: {type: String}
});

fileSchema.plugin(uniqueValidator)

module.exports = mongoose.model("File", fileSchema);
