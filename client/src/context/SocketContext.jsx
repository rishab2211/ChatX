import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAppStore } from "../store/index.js";

const SocketContext = createContext(null);
import { HOST } from "../utils/constants.js";
import { io } from "socket.io-client";



export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const { selectedChatData, selectedChatType, addMessage, userInfo } = useAppStore();

    // useEffect(()=>{
    //     console.log(userInfo);

    // },[])

    useEffect(() => {
        console.log("Current userInfo state:", userInfo);

        if (userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });

            console.log("socket current k niche")


            socket.current.on("connect", () => {
                console.log(`Connected to socket server`);

            })
            console.log("socket current connect k niche");

            const handleRecieveMessage = (message) => {
                console.log("Incoming message:", message);
            
                if (!selectedChatData || !message.sender || !message.recipient) {
                    console.error("Missing data:", {
                        selectedChatData,
                        sender: message.sender,
                        recipient: message.recipient,
                    });
                    return;
                }
            
                if (
                    selectedChatType !== undefined &&
                    (selectedChatData._id === message.sender._id ||
                        selectedChatData._id === message.recipient._id)
                ) {
                    console.log("Message received:", message);
                    addMessage(message);
                }
            };
            

            socket.current.on("recieveMessage", handleRecieveMessage);


            return () => {
                socket.current.disconnect();
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current} >
            {children}
        </SocketContext.Provider>
    )

}
