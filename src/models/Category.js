const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CategorySchema = new Schema({
    description: {
        type: String,
        required: true
    },
    user_id: { 
        type: Schema.ObjectId, ref: "User",
        required: true
    } 
});

module.exports = mongoose.model('Category', CategorySchema);