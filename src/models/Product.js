const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ProductSchema = new Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'] 
    },
    price: { 
        type: Number, 
        required: [true, 'Price is required'] 
    },
    description: { 
        type: String, 
        required: false 
    },
    status: { 
        type: Boolean, 
        required: true, 
        default: true 
    },
    category_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true
    },
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);