import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment } from "react-icons/gr";
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import EmojiPicker from "emoji-picker-react"

const MessageBar = () => {

    const [message, setMessage] = useState("");
    const emojiRef = useRef();
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);


    useEffect(()=>{
        function handleClickOutside(event){
            if(emojiRef.current && !emojiRef.current.contains(event.target)){
                setEmojiPickerOpen(false);
            }
        }

        document.addEventListener("mousedown",handleClickOutside);

        return ()=>{
            document.removeEventListener("mousedown", handleClickOutside);
        }
    },[emojiPickerOpen])

    const handleAddEmoji = (emoji)=>{
        setMessage((msg)=>msg+emoji.emoji)
    }

    const toggleEmojiPicker = ()=>{
        // console.log(`before click state :`+emojiPickerOpen);
        
        setEmojiPickerOpen((prev)=>!prev);
        
    }

    useEffect(()=>{
        console.log(`emojiPickerOpen state : ${emojiPickerOpen}`);
        
    },[emojiPickerOpen])

    return (
        <div className=' h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6 ' >
            <div className=' flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5 ' >
                <input type='text' placeholder='Enter message...' value={message} onChange={(e) => setMessage(e.target.value)} className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none  ' />
                <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all ' ><GrAttachment className='text-2xl' /></button>
                <div className='relative' >
                    <button onClick={toggleEmojiPicker} ref={emojiRef}  className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all ' >
                        <RiEmojiStickerLine className='text-2xl'  />
                    </button>
                    <div className=' absolute bottom-16 right-0 '   >
                        <EmojiPicker theme="dark" open={emojiPickerOpen} onEmojiClick={handleAddEmoji} />
                    </div>
                </div>
            </div>
            <button className='text-neutral-500 border border-slate-500 p-3 rounded-md  focus:border-none focus:outline-none focus:text-white duration-300 transition-all ' >
                <IoSend className='text-2xl' />
            </button>
        </div>
    )
}

export default MessageBar