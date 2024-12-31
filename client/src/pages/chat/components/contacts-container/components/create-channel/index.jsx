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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { FaPlus } from "react-icons/fa"
import Lottie from 'react-lottie';
import { animationDefaultOptions } from '../../../../../../lib/utils';
import apiCLient from '../../../../../../lib/api-client'
import { GET_ALL_CONTACTS, SEARCH_CONTACTS_ROUTE } from '../../../../../../utils/constants'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { HOST } from '../../../../../../utils/constants'
import { useAppStore } from '../../../../../../store'
import { Button } from '../../../../../../components/ui/button'
import MultipleSelector from '../../../../../../components/ui/multipleSelect'


const CreateChannel = () => {

    const [newChannelModal, setNewChannelModal] = useState(false);
    const [searchedContacts, setSearchedContacts] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const { setSelectedChatType, setSelectedChatData, selectedChatData, selectedChatType } = useAppStore();
    const handlenewChannelModalCLick = () => {
        setNewChannelModal((prev) => !prev)

    }

    useEffect(()=>{
        const getData= async ()=>{
            const response = await apiCLient.get(GET_ALL_CONTACTS,{withCredentials:true});
            setAllContacts(response.data.contacts);
        }
        getData();
    },[])

    const createChannel = async ()=>{
        console.log("creating channel....");
        
    }

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className='text-slate-400 hover:text-neutral-600 dark:hover:text-white   '
                            onClick={()=>setNewChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="   dark:text-white font-light opacity-90 transition-all duration-300  " >
                        <p>Create New Channel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={newChannelModal} onOpenChange={setNewChannelModal} >
                <DialogContent className="  border-none dark:text-white w-[400px]  h-[400px] flex flex-col cursor-pointer transition-all duration-300  " >
                    <DialogHeader>
                        <DialogTitle>Please Fill up the details for new channel</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Input placeholder="Channel Name" value={channelName} onChange={(e) => setChannelName(e.target.value)} className=" rounded-lg p-6  border " />
                    </div>
                    <div className='' >
                        <MultipleSelector
                        className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white " 
                        defaultOptions={allContacts}
                        placeholder="Search contacts"
                        value={selectedContacts}
                        onChange={setSelectedContacts}
                        emptyIndicator={
                            <p className='text-center text-large leading-10 text-gray-600 ' >No results found...</p>
                        }
                        />
                    </div>
                    <div className='' >
                        <Button className="w-full text-white bg-purple-500 hover:bg-purple-700 transition-all duration-300"
                        onClick={()=>createChannel()} >
                            Create Channel
                        </Button>
                    </div>


                </DialogContent>
            </Dialog>

        </>
    )
}

export default CreateChannel
