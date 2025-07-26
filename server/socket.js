import { Server as SocketIOServer } from "socket.io";
import Messages from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js"

// Function to setup socket.io server
// It initializes the socket.io server with CORS settings and handles user connections
const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Map to keep track of user socket connections
  // This maps user IDs to their respective socket IDs
  const userSocketMap = new Map();

  // Function to handle user disconnection
  const disconnect = (socket) => {
    // Remove the user from the userSocketMap when they disconnect
    // This ensures that the socket ID is no longer associated with the user ID
    for (const [userId, socketID] of userSocketMap.entries()) {
      if (socketID === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  // Function to send a message to the recipient and sender
  const sendMessage = async (message) => {

    // Extract sender and recipient from the message
    const { sender, recipient } = message;

    // Check if both sender and recipient are provided
    if (!sender || !recipient) {
      console.error("Sender and recipient are required to send a message.");
      return;
    }
    // Find the socket IDs for the sender and recipient
    // If either is not connected, the message will not be sent
    const senderSocketId = userSocketMap.get(sender);
    const recipientSocketId = userSocketMap.get(recipient);


    // create a new message in the database
    const createdMessage = await Messages.create(message);

    // If the message creation fails, log the error and return
    if (!createdMessage) {
      console.error("Failed to create message in the database.");
      return;
    }

    // Populate the message with sender and recipient details
    // This retrieves the full user details for both sender and recipient
    // This is useful for sending the complete message object to both users
    const messageData = await Messages.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");


    // If the recipient is connected, send the message to them
    // If the sender is connected, send the message to them as well
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData)
    }
  };

  // Function to send a channel message
  const sendChannelMessage = async (message) => {
    // Extract channel ID, sender, content, message type, and file URL from the message
    const { channelId, sender, content, messageType, fileUrl } = message;

    // create a new message in the database
    const createdMessage = await Messages.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,

    });


    // find the message by ID and populate the sender field
    // This retrieves the full user details for the sender
    const messageData = await Messages.findById(createdMessage._id).populate("sender", "id email firstName lastName image color").exec();

    // find and update the channel by ID
    // This adds the new message to the channel's messages array
    await Channel.findByIdAndUpdate(channelId,
      {
        $push: { messages: createdMessage._id },
      }
    );

    // Find the channel by ID and populate the members field
    const channel = await Channel.findById(channelId).populate("members");

    // finalData is the complete message object with channel ID
    const finalData = { ...messageData._doc, channelId: channel._id };

    // Emit the message to all members of the channel
    if (channel && channel.members) {
      // Loop through each member of the channel and emit the message to their socket ID
      channel.members.forEach((members) => {
        const memberSocketId = userSocketMap.get(members._id.toString());

        // If the member is connected, send the message to them
        // This ensures that only connected users receive the message
        // If the member is not connected, they will receive the message when they reconnect
        // This is useful for real-time updates in group chats or channels
        // It allows all members to see the new message immediately
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });


      // If the channel has an admin, send the message to the admin's socket ID
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieve-channel-message", finalData);
      }
    }
  }

  // Listen for incoming socket connections
  // When a user connects, their user ID is stored in the userSocketMap
  io.on("connection", (socket) => {

    // handshake.query contains the user ID sent from the client
    // This allows the server to identify which user is connecting
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    } else {
      console.log("User ID not provided during connection,");
    }

    // send message and channel message handlers
    socket.on("sendMessage", (message) => {
      sendMessage(message);
    });
    socket.on("send-channel-message", sendChannelMessage);

    // Handle user disconnection
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
