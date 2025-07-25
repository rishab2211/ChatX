import { useEffect, useState } from 'react'
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
import { Input } from "@/components/ui/input"
import { FaPlus } from "react-icons/fa"
import apiCLient from '../../../../../../lib/api-client'
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS, SEARCH_CONTACTS_ROUTE } from '../../../../../../utils/constants'
import { useAppStore } from '../../../../../../store'
import { Button } from '../../../../../../components/ui/button'
import MultipleSelector from '../../../../../../components/ui/multipleSelect'

const CreateChannel = () => {
    const [newChannelModal, setNewChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addChannel } = useAppStore();

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await apiCLient.get(GET_ALL_CONTACTS, { withCredentials: true });
                if (response.data?.contacts) {
                    setAllContacts(response.data.contacts);
                }
            } catch (error) {
                console.error("Failed to fetch contacts:", error);
            }
        }
        getData();
    }, []);

    const createChannel = async () => {
        try {
            if (channelName.length >= 0 && selectedContacts.length >= 0) {
                const response = await apiCLient.post(CREATE_CHANNEL_ROUTE,
                    {
                        nameOfChannel: channelName,
                        members: selectedContacts.map((contact) => contact.value)
                    },
                    { withCredentials: true }
                );

                if (response.status === 201) {
                    addChannel(response.data.channel);
                    setChannelName("");
                    setSelectedContacts([]);
                    setNewChannelModal(false);
                }
            }
        } catch (err) {
            console.log(err);
            
        }
    }

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className='text-slate-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer'
                            onClick={() => setNewChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="dark:text-white font-light opacity-90 transition-all duration-300">
                        <p>Create New Channel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
                <DialogContent className="border-none dark:text-white w-[400px] h-[400px] flex flex-col cursor-pointer transition-all duration-300">
                    <DialogHeader>
                        <DialogTitle>Please fill in the details for new channel</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Channel Name"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            className="rounded-lg p-6 border"
                        />
                    </div>
                    <div className="my-4">
                        <MultipleSelector
                            className="rounded-lg  py-2 "
                            defaultOptions={allContacts}
                            placeholder="Search contacts"
                            value={selectedContacts}
                            onChange={setSelectedContacts}
                            emptyIndicator={
                                <p className="text-center text-large leading-10 text-gray-600">No results found...</p>
                            }
                        />
                    </div>
                    <div>
                        <Button
                            className="w-full text-white bg-purple-500 hover:bg-purple-700 transition-all duration-300 disabled:opacity-60"
                            onClick={createChannel}
                            disabled={isLoading || !channelName.trim() || selectedContacts.length === 0}
                        >
                            {isLoading ? 'Creating...' : 'Create Channel'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateChannel