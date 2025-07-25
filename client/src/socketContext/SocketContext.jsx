import { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "../store/index.js";
import { HOST } from "../utils/constants.js";

// Create the context to hold the socket instance
const SocketContext = createContext(null);

// Custom hook for easy access to the socket instance
export const useSocket = () => {
    return useContext(SocketContext);
};

// Provider component to wrap the application
export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { userInfo } = useAppStore();

    // Memoized handler for receiving direct messages
    const handleReceiveMessage = useCallback((message) => {
        const { selectedChatData, addMessage, addContactsInDMContact } = useAppStore.getState();

        // If the message is for the currently active chat, add it to the view
        if (selectedChatData && (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)) {
            addMessage(message);
        }

        // Always update the contact list to show notification/new message indicator
        addContactsInDMContact(message);
    }, []);

    // Memoized handler for receiving channel messages
    const handleReceiveChannelMessage = useCallback((message) => {
        const { selectedChatData, addMessage, addChannelInChannelList } = useAppStore.getState();

        if (selectedChatData && selectedChatData._id === message.channelId) {
            addMessage(message);
        }

        // Always update the channel list
        addChannelInChannelList(message);
    }, []);


    useEffect(() => {
        // Don't connect if there's no logged-in user
        if (!userInfo) {
            return;
        }

        // Establish the socket connection
        socket.current = io(HOST, {
            withCredentials: true,
            query: { userId: userInfo.id },
        });

        // Attach event listeners
        socket.current.on("connect", () => {
            console.log(`Socket connected: ${socket.current.id}`);
        });
        socket.current.on("recieveMessage", handleReceiveMessage);
        socket.current.on("recieve-channel-message", handleReceiveChannelMessage);

        // This is the cleanup function that runs when the component unmounts
        // or when `userInfo` changes.
        return () => {
            if (socket.current) {
                // IMPORTANT: Remove event listeners to prevent memory leaks
                socket.current.off("connect");
                socket.current.off("recieveMessage", handleReceiveMessage);
                socket.current.off("recieve-channel-message", handleReceiveChannelMessage);
                socket.current.disconnect();
                socket.current = null;
            }
        };
    }, [userInfo, handleReceiveMessage, handleReceiveChannelMessage]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};