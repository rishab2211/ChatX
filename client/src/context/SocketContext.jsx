import { createContext, useContext,useState, useEffect, useRef } from "react";
import { useAppStore } from "../store/index.js";

const SocketContext = createContext(null);
import { HOST } from "../utils/constants.js";
import { io } from "socket.io-client";



export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const { userInfo } = useAppStore();
 
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
 
            // yeh wala code nhi chal rha 
            socket.current.on("connect", () => {
                console.log(`Connected to socket server`);
 
            })
            console.log("socket current connect k niche");
            
 
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
