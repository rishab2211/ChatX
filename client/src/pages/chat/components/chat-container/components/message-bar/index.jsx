import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment } from "react-icons/gr";
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import EmojiPicker from "emoji-picker-react"
import { useAppStore } from '../../../../../../store';
import { useSocket } from '../../../../../../socketContext/SocketContext';
import { UPLOAD_FILES_ROUTE } from '../../../../../../utils/constants';
import apiClient from "../../../../../../lib/api-client"
import apiCLient from '../../../../../../lib/api-client';
const MessageBar = () => {
    const [message, setMessage] = useState("");
    const emojiRef = useRef();
    const fileInputRef = useRef();
    const socket = useSocket();
    const { selectedChatType, selectedChatData, userInfo } = useAppStore();
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            // Only close if the click is outside both the button and the picker
            if (emojiRef.current &&
                !emojiRef.current.contains(event.target) &&
                !event.target.closest('.EmojiPickerReact')) {
                setEmojiPickerOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [emojiPickerOpen]);

    const handleAddEmoji = (emoji) => {
        setMessage((msg) => msg + emoji.emoji);
        // Don't close the picker after selecting an emoji
    }

    const handleSendMessage = async () => {
        if (selectedChatType === "contact") {

            socket.emit("sendMessage", {
                sender: userInfo.id,
                content: message,
                recipient: selectedChatData._id,
                messageType: "text",
                fileUrl: undefined
            });
        }else if(selectedChatType==="channel"){
            console.log({
                sender: userInfo.id,
                content:message,
                messageType: "text",
                fileUrl: undefined,
                channelId : selectedChatData._id
            });
            
            socket.emit("send-channel-message",{
                sender: userInfo.id,
                content:message,
                messageType: "text",
                fileUrl: undefined,
                channelId : selectedChatData._id
            });
        }
        setMessage("");
    }

    const toggleEmojiPicker = (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        setEmojiPickerOpen((prev) => !prev);
    }

    const handleAttachmentClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }
    const handleAttachmentChange = async (event) => {

        try {
            const file = event.target.files[0];

            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await apiCLient.post(UPLOAD_FILES_ROUTE,
                    formData,
                    { withCredentials: true }
                );


                if (response.status === 200 && response.data) {
                    if (selectedChatType === "contact") {
                        socket.emit("sendMessage", {
                            sender: userInfo.id,
                            content: undefined,
                            recipient: selectedChatData._id,
                            messageType: "file",
                            fileUrl: response.data.filePath
                        });
                    }
                else if(selectedChatType==="channel"){
                    socket.emit("send-channel-message",{
                        sender: userInfo.id,
                        content:undefined,
                        messageType: "file",
                        fileUrl: response.data.filePath,
                        channelId : selectedChatData._id
                    })
                }}
            }


        } catch (err) {
            console.log(err);

        }

    }



    return (
        <div className='h-[10vh] flex justify-center items-center px-8 mb-0 gap-6'>
            <div className='flex-1 bg-slate-100 dark:bg-slate-900 text-black dark:text-white flex rounded-md items-center gap-5 pr-5'>
                <input
                    type='text'
                    placeholder='Enter message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none'
                />
                <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
                    onClick={handleAttachmentClick}>
                    <GrAttachment className='text-2xl' />
                </button>
                <input type='file' className='hidden' ref={fileInputRef} onChange={handleAttachmentChange} />
                <div className='relative'>
                    <button
                        onClick={toggleEmojiPicker}
                        ref={emojiRef}
                        className='text-yellow-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
                    >
                        <RiEmojiStickerLine className='text-2xl' />
                    </button>
                    <div className='absolute bottom-16 right-0'>
                        <EmojiPicker
                            theme="dark"
                            open={emojiPickerOpen}
                            onEmojiClick={handleAddEmoji}
                        />
                    </div>
                </div>
            </div>
            <button className='text-neutral-500 border border-slate-500 p-3 rounded-md focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
                onClick={handleSendMessage}>
                <IoSend className='text-2xl' />
            </button>
        </div>
    )
}

export default MessageBar
