 import { Server as SocketIOServer } from "socket.io";

const setupSocket = (server)=>{
    const io = new SocketIOServer(server,
        {
            cors:{
                origin: process.env.ORIGIN,
                methods: ["GET","POST"],
                credentials:true
            }
        }
    );

    const userSocketMap = new Map();

    const disconnect = (socket)=>{
        console.log(`Client Disconnected : ${socket.id}`);
        for(const [userId, socketID] of userSocketMap.entries()){
            if(socketID===socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }
    }

    io.on("connection",(socket)=>{
        const userId = socket.handshake.query.userId;
        if(userId){
            userSocketMap.set(userId, socket.id);
            console.log(`User connected : ${userId} with socket ID : ${socket.id} `); 
        }else{
            console.log("User ID not provided during connection,");    
        }

        socket.on("disconnect",()=>disconnect(socket))

    })
}

export default setupSocket;