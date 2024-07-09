require("dotenv").config(); // Load environment variables

const products_route = require("./routes/products"); // Import your products route
const connectDB = require('./db/connect'); // Import database connection function
const express = require('express');
const cors = require('cors');
const http = require('http');  // HTTP server
const { Server } = require('socket.io'); // Socket.IO for real-time communication
const Message = require('./models/messages');

const app = express();
const server = http.createServer(app); // Create HTTP server

const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin
    methods: ["GET", "POST"]
  }
});
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
    try {
      console.log("Received join request. User ID:", userId, "Username:", username);
      const userRoom = `user_${userId}`;
      socket.join(userRoom);
      activeRooms[userRoom] = { id: userId, name: username }; // Customize as needed
      io.to('admin').emit('activeRooms', activeRooms);
      console.log(`User with ID ${userId} and username ${username} joined room ${userRoom}`);

      const messages = await Message.find({ userId }).sort('timestamp');
      socket.emit('previousMessages', { userId, messages });
    } catch (error) {
      console.error('Error in join event:', error);
    }
  });

  // Handle user message
  socket.on('message', async (data) => {
    try {
      const { userId, message, username } = data;
      const timestamp = new Date().toISOString(); // Add timestamp
      const newMessage = new Message({ userId, message, sentBy: 'user', username, timestamp });
      await newMessage.save();

      io.to('admin').emit('message', { userId, message, username, timestamp });
      console.log(`Message from user ${userId} (${username}): ${message}`);
    } catch (error) {
      console.error('Error in message event:', error);
    }
  });

  // Handle admin message
  socket.on('adminMessage', async (data) => {
    try {
      const { userId, message } = data;
      const userRoom = `user_${userId}`;
      const timestamp = new Date().toISOString(); // Add timestamp
      const newMessage = new Message({ userId, message, sentBy: 'admin', username: 'Admin', timestamp });
      await newMessage.save();

      io.to(userRoom).emit('message', { message, username: 'Admin', timestamp: newMessage.timestamp });
      console.log(`Message to user ${userId}: ${message}`);
    } catch (error) {
      console.error('Error in adminMessage event:', error);
    }
  });

  // Handle admin joining
  socket.on('adminJoin', () => {
    try {
      socket.join('admin');
      socket.emit('activeRooms', activeRooms);
      console.log('Admin joined the admin room');
    } catch (error) {
      console.error('Error in adminJoin event:', error);
    }
  });

  // Handle fetching messages for a specific user (requested by admin)
  socket.on('fetchMessages', async (userId) => {
    try {
      const messages = await Message.find({ userId }).sort('timestamp');
      socket.emit('previousMessages', { userId, messages });
    } catch (error) {
      console.error('Error in fetchMessages event:', error);
    }
  });

  // Handle user/admin disconnection
  socket.on('disconnect', () => {
    let userId = null;
    try {
      for (const room in activeRooms) {
        if (activeRooms[room].id === socket.id) {
          userId = activeRooms[room].id;
          delete activeRooms[room];
          io.to('admin').emit('activeRooms', activeRooms);
        }
      }
      console.log(`User with ID ${userId} disconnected`);
    } catch (error) {
      console.error('Error in disconnect event:', error);
    }
  });
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
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
