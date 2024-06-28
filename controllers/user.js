const { query } = require("express");
const bcrypt = require('bcryptjs');
require("dotenv").config()

const jwt = require("jsonwebtoken")
const User = require("../models/user");


const signUp = async (req, res) => {
    const { email, username, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Please Fill All Fields" })
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User Exist")
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        //  const salt = await bcrypt.genSalt(10);
        //  const hashPassword = await bcrypt.hash(password, salt);
        const newuser = new User({
            username,
            email,
            password
        })
        //   const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_TOKEN, { expiresIn: '1h' });
        await newuser.save();


        res.status(201).json({
            message: "UserCreated", user: newuser, token: await newuser.generateToken(),
            userId: newuser._id.toString(),
        })
    }
    catch (error) {
        res.status(500).json({ error: "Server Error" })
        console.log(error)
    }
}


const signIn = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill all the fields" })
    }

    try {

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Email Not found " })
        }

        const match = await bcrypt.compare(password, user.password);

        if ((user.email == email) && match) {


            const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, { expiresIn: '1h' });

            res.status(200).json({ message: "Login Success", user: user, "token": token })

        }
        else {
            return res.status(400).json({ error: "Invalid email or password" })
        }






    } catch (error) {
        res.status(500).json({ error: "Server Error" })
        console.log(error)
    }

}

module.exports = { signUp, signIn };