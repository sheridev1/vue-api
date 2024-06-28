const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
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
   
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    deliveryCharges: {
        type: Number,
        required: true,
    },
    finalTotal: {
        type: Number,
        required: true,
    },
    notes: String,
    paymentMethod: {
        type: String,
        enum: ['COD', 'credit_card', 'bank_transfer'],
        required: true

    },
    orderDate: {
        type: Date,
        default: Date.now
    }
})


module.exports=mongoose.model("Order", orderSchema)