import React from 'react';
import { RiCloseFill } from "react-icons/ri";
import { useAppStore } from '../../../../../../store';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HOST } from '../../../../../../utils/constants';
import { getColor } from '../../../../../../lib/utils';

const ChatHeader = () => {
    const { closeChat, selectedChatData, selectedChatType } = useAppStore();

    return (
        <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
            <div className="flex gap-5 items-center">
                <div className="flex gap-3 items-center">
                    {
                        selectedChatType==="contact" ? <div className="w-12 h-12 relative">
                        <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                            { selectedChatData.image ? (
                                <AvatarImage
                                    src={`${HOST}/${selectedChatData.image}`}
                                    alt="profile-image"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div
                                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center ${getColor(
                                        selectedChatData.color
                                    )}`}
                                >
                                    {selectedChatData.firstName
                                        ? selectedChatData.firstName.charAt(0) 
                                        : selectedChatData.email.charAt(0)}
                                </div>
                            )}
                        </Avatar>
                    </div> :
                    (<div className=' bg-yellow-500 h-10 w-10 flex items-center justify-center rounded-full  ' >
                        #
                    </div>)

                    }
                    
                    
                    <div className="dark:text-white text-black font-semibold">
                        {selectedChatType === "contact" && selectedChatData.firstName
                            ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                            : selectedChatData.email}

                        {selectedChatType==="channel" && selectedChatData.nameOfChannel }
                    </div>
                </div>
            </div>
            <button
                className="dark:text-neutral-500 text-neutral-700 focus:text-neutral-800 focus:border-none focus:outline-none dark:focus:text-neutral-300 duration-300 transition-all"
                onClick={closeChat}
            >
                <RiCloseFill className="text-3xl" />
            </button>
        </div>
    );
};

export default ChatHeader;
