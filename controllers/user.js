const bcrypt = require('bcryptjs');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { editProduct } = require('./products');

const signUp = async (req, res) => {
    const { email, username, password, role } = req.body;
    console.log(req.body)

    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "Please Fill All Fields" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User Exist");
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });


        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_TOKEN, { expiresIn: '1h' });


        res.status(201).json({
            message: "User Created",
            user: newUser,
            token: token,
            userId: newUser._id.toString(),
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
        console.log(error);
    }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill all the fields" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Email Not found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if ((user.email == email) && match) {
            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_TOKEN, { expiresIn: '1h' });

            res.status(200).json({ message: "Login Success", user: user, token: token });
        } else {
            return res.status(400).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
        console.log(error);
    }
};


// GET all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        res.json(users); // Send JSON response with the users array
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};



const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: err.message });
    }
}


const EditUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updates = req.body;

        // Check if password needs to be updated
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        Object.assign(user, updates);
        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { signUp, signIn, getAllUsers, deleteUser, EditUser };
