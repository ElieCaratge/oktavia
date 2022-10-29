const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const fileSchema = new mongoose.Schema({
    contentType: {type: String, required: true},
    url: {type: String, required: true},
    // User who uploaded the file, to retrieve its origin.
    userId: {type: String, required: true},
    // Users who have access to this file.
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    ]
    }, { virtuals: {
        filename: {
            get() {
                // from https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
                return this.url.replace(/^.*[\\\/]/, '');
            }
        }
    }});

module.exports = mongoose.model("File", fileSchema);
