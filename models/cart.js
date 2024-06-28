const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
    item: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            require: true,
            default: 1
        }
    }
    ],
    user: {
        type: mongoose.Schema.ObjectId, ref: "User",
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0
    }


})


module.exports = mongoose.model("Cart", cartSchema)