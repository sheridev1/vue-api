const mongoose = require("mongoose");
const { options } = require("../routes/products");


const connectDB =async () => {

    try {
        await mongoose.connect(process.env.MONGOS_URL);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
    

}

module.exports = connectDB