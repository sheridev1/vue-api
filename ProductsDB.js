require('dotenv').config()
const express = require('express');
const Product = require("./models/products");
const User = require('./models/user');

const ProductJson = require("./products.json");
const UserJson = require("./users.json");
const connectDB = require('./db/connect');

const start = async () => {
    try {
        await connectDB(process.env.MONGOS_URL)
        // await Product.deleteMany()
        await Product.create(ProductJson)
        //     await User.create(UserJson)
        console.log("Success")
    }
    catch (error) {
        console.log(error);
    }
}


start()