import React from 'react'
import { RiCloseFill } from "react-icons/ri"

const ChatHeader = () => {
    return (
        <div className=' h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20  ' >
            <div className='flex gap-5 items-center  ' >
                <div className='flex gap-3 items-center justify-center ' >
                    <div className=' flex justify-center items-center gap-5  ' >
                        <button className='dark:text-neutral-500 text-neutral-700 focus:neutral-800 focus:border-none focus:outline-none dark:focus:text-white dark:focus:text-neutral-300 duration-300 transition-all '   >
                            <RiCloseFill className='text-3xl' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatHeader