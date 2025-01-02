import { Server as SocketIOServer } from "socket.io";
import Messages from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js"
const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected : ${socket.id}`);
    for (const [userId, socketID] of userSocketMap.entries()) {
      if (socketID === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    console.log(`sender socket id : ${senderSocketId}`);
    
    const recipientSocketId = userSocketMap.get(message.recipient);
    console.log(`recipient socket id : ${recipientSocketId}`);
    

    const createdMessage = await Messages.create(message);
    console.log(`created messsage : ${createdMessage}`);
    

    const messageData = await Messages.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

      console.log(`message data : ${messageData}`);
      

      if(recipientSocketId){
        io.to(recipientSocketId).emit("recieveMessage",messageData);
      }
      if(senderSocketId){
        io.to(senderSocketId).emit("recieveMessage",messageData)
      }
  };

  const sendChannelMessage= async (message)=>{
    const {channelId, sender, content, messageType, fileUrl} = message;

    const createdMessage = await Messages.create({
      sender,
      recipient:null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,

    });
       

    const messageData = await Messages.findById(createdMessage._id).populate("sender","id email firstName lastName image color").exec();

    
    
    await Channel.findByIdAndUpdate(channelId,
      {
        $push: {messages: createdMessage._id},
      }
    );

    const channel = await Channel.findById(channelId).populate("members");

    const finalData = {...messageData._doc, channelId: channel._id};

    console.log(finalData);
    

    if(channel && channel.members){
      console.log("channel members : "+channel.members);
      
      channel.members.forEach((members)=>{
        const memberSocketId = userSocketMap.get(members._id.toString());
        console.log("membersSocket id :"+memberSocketId);
        

        if(memberSocketId){
          io.to(memberSocketId).emit("recieve-channel-message",finalData);
        }
                
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if(adminSocketId){
        io.to(adminSocketId).emit("recieve-channel-message",finalData);
      }
    }
  }

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User :${userId} connected  with socket ID : ${socket.id} `);
    } else {
      console.log("User ID not provided during connection,");
    }

    socket.on("sendMessage", (message) => {
      console.log("Message received on server:", message);
      sendMessage(message); 
  });
  socket.on("send-channel-message",sendChannelMessage);
  
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
