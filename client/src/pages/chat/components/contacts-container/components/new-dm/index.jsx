import React, { useEffect, useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { FaPlus } from "react-icons/fa"
import Lottie from 'react-lottie';
import { animationDefaultOptions } from '../../../../../../lib/utils';
import apiCLient from '../../../../../../lib/api-client'
import { SEARCH_CONTACTS_ROUTE } from '../../../../../../utils/constants'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { HOST } from '../../../../../../utils/constants'
const NewDM = () => {

    const [openNewContactModal, setOpenNewContactModal] = useState(false);
    const [searchedContacts, setSearchedContacts] = useState([]);

    const handleOpenNewContactModalCLick = () => {
        setOpenNewContactModal((prev) => !prev)

    }

    const searchContacts = async (searchTerm) => {
        try {
            if (searchTerm.length > 0) {
                const response = await apiCLient.post(
                    SEARCH_CONTACTS_ROUTE,
                    { searchTerm },
                    { withCredentials: true }
                );

                if (response.status === 200 && response.data.contacts) {
                    setSearchedContacts(response.data.contacts)
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className='text-neutral-400 hover:text-white   '
                            onClick={handleOpenNewContactModalCLick}
                        />
                    </TooltipTrigger>
                    <TooltipContent className=" bg-[#1c1b1e]  text-white font-light opacity-90 transition-all duration-300  " >
                        <p>Select new contact</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
 
            <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal} >
                <DialogContent className=" bg-[#181920] border-none text-white w-[400px]  h-[400px] flex flex-col cursor-pointer transition-all duration-300  " >
                    <DialogHeader>
                        <DialogTitle>Please select a contact</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Input placeholder="search contacts..." onChange={(e) => searchContacts(e.target.value)} className=" rounded-lg p-6 bg-[#2c2e3b] border-none  " />
                    </div>

                    {
                        searchedContacts.length <= 0 && <div>
                            <div className=' flex-1 md:flex flex-col justify-center items-center hidden duration-1000 transition-all ' >
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    height={100}
                                    width={100}
                                    options={animationDefaultOptions}
                                />
                                <div className=' text-opacity-80 text-white flex flex-col gap-10 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center  ' >
                                    <h4 className='poppins-medium' >
                                        Searching<span className='text-purple-500' >...</span>
                                    </h4>
                                </div>
                            </div>
                        </div>
                    }
                    <ScrollArea className=" h-[250px]  ">
                        {
                            searchedContacts.map((contact) => (
                                <div key={contact._id} className='flex gap-5 cursor-pointer hover:bg-[#463d6d] p-2 rounded-lg ' >
                                    <div className=' w-12 h-12 relative flex gap-5  ' >
                                        <Avatar className=" h-12 w-12 rounded-full overflow-hidden ">
                                            {contact.image ? (
                                                <AvatarImage
                                                    src={`${HOST}/${contact.image}`}
                                                    alt="profile-image"
                                                    className=" object-cover w-full h-full "
                                                />
                                            ) : (
                                                <div
                                                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center ${getColor(
                                                        contact.color
                                                    )} `}
                                                >
                                                    {contact.firstName
                                                        ? contact.firstName.split("").shift()
                                                        : contact.email.split("").shift()}
                                                </div>
                                            )}
                                        </Avatar>
                                        <div className=' flex flex-col ' >
                                            <span>
                                                {contact.firstName && contact.lastName ?
                                                    `${contact.firstName} ${contact.lastName}` : ""}
                                            </span>
                                            <span className='text-xs' >{contact.email}</span>

                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </ScrollArea>
                </DialogContent>
            </Dialog>
 
        </>
    )
}

export default NewDM