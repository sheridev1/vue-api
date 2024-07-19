const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true, unique: false, maxlength: 60 },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["admin", "client", "editor"],
    default: "client",
    required: true,
  },
  //cart: [
  //    {
  //        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
  //       quantity: { type: Number, default: 1 }
  //   }
  // ]
});



// json web token
userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        role: this.role,
      },
      process.env.JWT_TOKEN,
      {
        expiresIn: "1h",
      }
    );
  } catch (error) {
    console.error(error);
  }
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
