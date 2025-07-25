import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../../../../../store';
import apiCient from '../../../../../../lib/api-client';
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS } from '../../../../../../utils/constants';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import MultipleSelector from '@/components/ui/multipleSelect'; // Assuming this is shadcn-multi-select
import { FaPlus } from "react-icons/fa";
import { FaSpinner } from 'react-icons/fa';

const CreateChannel = () => {
    // Component State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addChannel } = useAppStore();

    // Fetch contacts when the component mounts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await apiCient.get(GET_ALL_CONTACTS, { withCredentials: true });
                if (response.data?.contacts) {

                    setAllContacts(response.data.contacts);
                }
            } catch (err) {
                console.error("Failed to fetch contacts:", err);
                // In a real app, you might want a more prominent error display
            }
        };
        fetchContacts();
    }, []);

    // Resets the form state
    const resetForm = () => {
        setChannelName("");
        setSelectedContacts([]);
        setError(null);
        setIsLoading(false);
    };

    // Handle closing the modal
    const handleModalClose = (open) => {
        if (!open) {
            resetForm();
        }
        setIsModalOpen(open);
    };

    // Handle the channel creation logic
    const handleCreateChannel = useCallback(async (e) => {
        e.preventDefault(); // Prevent default form submission

        if (!channelName.trim() || selectedContacts.length === 0) {
            setError("Channel name and at least one member are required.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const memberIds = selectedContacts.map(contact => contact.value);
            const response = await apiCient.post(CREATE_CHANNEL_ROUTE, {
                nameOfChannel: channelName,
                members: memberIds,
            }, { withCredentials: true });

            if (response.status === 201) {
                addChannel(response.data.channel);
                handleModalClose(false); // Close modal and reset form
            }
        } catch (err) {
            console.error("Failed to create channel:", err);
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [channelName, selectedContacts, addChannel]);

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button onClick={() => setIsModalOpen(true)} className="p-2" aria-label="Create New Channel">
                            <FaPlus className='text-slate-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors' />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Create New Channel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                    <DialogHeader>
                        <DialogTitle>Create a New Channel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateChannel} className="flex flex-col gap-5">
                        {error && (
                            <p className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-center text-sm p-2 rounded-md">
                                {error}
                            </p>
                        )}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="channel-name" className="text-sm font-medium">Channel Name</label>
                            <Input
                                id="channel-name"
                                placeholder="e.g., Project Alpha"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="select-members" className="text-sm font-medium">Select Members</label>
                            <MultipleSelector
                                id="select-members"
                                defaultOptions={allContacts}
                                placeholder="Search and select contacts..."
                                value={selectedContacts}
                                onChange={setSelectedContacts}
                                emptyIndicator={
                                    <p className="text-center text-sm p-4">No results found.</p>
                                }
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:bg-purple-400 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <FaSpinner className="animate-spin" /> Creating...
                                </span>
                            ) : (
                                'Create Channel'
                            )}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CreateChannel;