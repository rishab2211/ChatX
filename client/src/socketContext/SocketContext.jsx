import { createContext, useContext, useEffect, useRef } from "react";


const SocketContext = createContext(null);
import { HOST } from "../utils/constants.js";
import { io } from "socket.io-client";
import { useAppStore } from "../store/index.js";



export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const {  userInfo } = useAppStore() ;

    useEffect(() => {
        // console.log("Current userInfo state:", userInfo);

        if (userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });

            // console.log("socket current k niche")


            socket.current.on("connect", () => {
                console.log(`Connected to socket server`);

            })
            // console.log("socket current connect k niche");

            const handleRecieveMessage = (message) => {

                const {selectedChatData,selectedChatType, addMessage, addContactsInDMContact} = useAppStore.getState();
                // console.log("selected Chat data :"+selectedChatData._id);
                // console.log("message sender :"+message.sender._id);
                // console.log("message sender :"+message.recipient._id);
                
                
                if(selectedChatType!==undefined &&
                    (selectedChatData._id===message.sender._id ||
                    selectedChatData._id===message.recipient._id)
                ){
                    console.log("message recieved : "+message);
                    console.log("calling addmessage");
                    
                    addMessage(message);
                }
                console.log("calling addcontactsinlist");
                
                addContactsInDMContact(message);
            };

            const handleRecieveChannelMessage = (message)=>{
                const {selectedChatData,selectedChatType, addMessage, addChannelInChannelList} = useAppStore.getState();

                if(selectedChatType!==undefined && selectedChatData._id === message.channelId){
                    addMessage(message);
                }
                console.log("calling addchannellist");
                
                addChannelInChannelList(message);
                
            }

            socket.current.on("recieveMessage", handleRecieveMessage);
            socket.current.on("recieve-channel-message",handleRecieveChannelMessage)

            console.log("page re-rendered");
            

            return () => {
                socket.current.disconnect();
            }
        }
    }, [userInfo]);

    const refreshPage = () => {
        window.location.reload();
    };
    

    return (
        <SocketContext.Provider value={socket.current} >
            {children}
        </SocketContext.Provider>
    )

}

