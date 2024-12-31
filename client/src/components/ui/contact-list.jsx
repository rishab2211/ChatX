import React, { useEffect, useInsertionEffect } from 'react';
import { useAppStore } from '../../store';
import { Avatar, AvatarImage } from "./avatar";
import { HOST } from '../../utils/constants';
import { getColor } from '../../lib/utils';

const ContactList = ({ contacts, isChannel = false }) => {
    const {
        selectedChatData,
        selectedChatType,
        setSelectedChatData,
        setSelectedChatType,
        // setSelectedChatMessages
    } = useAppStore();

    const handleClick = (contact) => {
        if (isChannel) {
            setSelectedChatType("channel");
        } else {
            setSelectedChatType("contact");
        }

        if (selectedChatData && selectedChatData._id === contact._id) {
            return;
        } else {
            setSelectedChatData(contact);
        }
    };

    useEffect(() => {
        console.log(isChannel);

    }, [selectedChatType])

    return (
        <div className="mt-5 text-black dark:text-white">
            {contacts.map(contact => (
                <div
                    key={contact._id}
                    className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && selectedChatData._id === contact._id
                            ? "bg-[#8417ff] hover:bg-[#8417ff]"
                            : "hover:bg-[#f1f1f111]"
                        }`}
                    onClick={() => handleClick(contact)}
                >
                    <div className={`flex gap-5 items-center ${selectedChatData && selectedChatData._id === contact._id? " text-white ":"text-black"} dark:text-white`} >
                        {!isChannel && (

                            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                {contact.image ? ( // Correctly using `contact.image`
                                    <AvatarImage
                                        src={`${HOST}/${contact.image}`}
                                        alt="profile-image"
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div
                                        className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center ${getColor(
                                            contact.color
                                        )}`}
                                    >
                                        {contact.firstName
                                            ? contact.firstName.charAt(0) // Get the first letter of the first name
                                            : contact.email.charAt(0)}
                                    </div>
                                )}
                            </Avatar>
                        )}

                        {
                            isChannel && (<div className=' bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full  ' >
                                #
                            </div>)
                        }
                        {
                            isChannel ? <span>{contact.name}</span> : <span>{`${contact.firstName} ${contact.lastName}`}</span>
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ContactList;
