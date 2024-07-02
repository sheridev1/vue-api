require("dotenv").config(); // Load environment variables

const products_route = require("./routes/products"); // Import your products route
const connectDB = require('./db/connect'); // Import database connection function
const express = require('express');
const bodyParser = require('body-parser'); // Not necessary with express.json()
const cors = require('cors');
const http = require('http');  // HTTP server
const socketIo = require('socket.io'); // Socket.IO for real-time communication
const Message = require('./models/messages');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // Create HTTP server

const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin
    methods: ["GET", "POST"]
  }
});
//const io = socketIo(server); // Attach Socket.IO to the server
const PORT = process.env.PORT || 5000; // Set port from environment variable or default to 5000

app.use(cors()); // Enable CORS

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get('/', (req, res) => {
  res.send("API IS CREATED");
});

// Mount products route
app.use("/api/", products_route);


let activeRooms = {};

app.use(express.static('public'));

//handling connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a room
  socket.on('join', async (userId, username) => {
    console.log("Received join request. User ID:", userId, "Username:", username);
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    activeRooms[userRoom] = { id: userId, name: username }; // Customize as needed
    io.to('admin').emit('activeRooms', activeRooms);
    console.log(`User with ID ${userId} and username ${username} joined room ${userRoom}`);

    const messages = await Message.find({ userId }).sort('timestamp');
    socket.emit('previousMessages', { userId, messages });
  });

  // Handle user message
  socket.on('message', async (data) => {
    const { userId, message, username } = data;
    const newMessage = new Message({ userId, message, sentBy: 'user', username });
    await newMessage.save();

    io.to('admin').emit('message', { userId, message, username });
    console.log(`Message from user ${userId} (${username}): ${message}`);
  });

  // Handle admin message
  socket.on('adminMessage', async (data) => {
    const { userId, message } = data;
    const userRoom = `user_${userId}`;
    const newMessage = new Message({ userId, message, sentBy: 'admin', username: 'Admin' });
    await newMessage.save();

    io.to(userRoom).emit('message', { message, username: 'Admin' });
    console.log(`Message to user ${userId}: ${message}`);
  });

  // Handle admin joining
  socket.on('adminJoin', () => {
    socket.join('admin');
    socket.emit('activeRooms', activeRooms);
    console.log('Admin joined the admin room');
  });

  // Handle fetching messages for a specific user (requested by admin)
  socket.on('fetchMessages', async (userId) => {
    const messages = await Message.find({ userId }).sort('timestamp');
    socket.emit('previousMessages', { userId, messages });
  });

  // Handle user/admin disconnection
  socket.on('disconnect', () => {
    let userId = null;
    for (const room in activeRooms) {
      if (activeRooms[room].id === socket.id) {
        userId = activeRooms[room].id;
        delete activeRooms[room];
        io.to('admin').emit('activeRooms', activeRooms);
      }
    }
    console.log(`User with ID ${userId} disconnected`);
  });
});

// Start function to connect to database and start server
const start = async () => {
  try {
    await connectDB(); // Connect to database

    server.listen(PORT, () => {
      console.log(`${PORT} port is connected`);
    });

  } catch (error) {
    console.error(error);
  }
};

start(); // Call start function to begin execution
