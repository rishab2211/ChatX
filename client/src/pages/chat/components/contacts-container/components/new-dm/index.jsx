import { useState, useCallback } from 'react'
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
import { FaPlus, FaSearch } from "react-icons/fa"
import Lottie from 'react-lottie'
import apiCLient from '../../../../../../lib/api-client'
import { SEARCH_CONTACTS_ROUTE } from '../../../../../../utils/constants'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { HOST } from '../../../../../../utils/constants'
import { useAppStore } from '../../../../../../store'
import { getColor } from '../../../../../../lib/utils'
import { animationDefaultOptionsChatLoading } from '../../../../../../App'

const NewDM = () => {

    // Modal state for new contact dialog
    const [openNewContactModal, setOpenNewContactModal] = useState(false)

    // State for search results and loading/error states
    const [searchedContacts, setSearchedContacts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // App store actions to set selected chat type and data
    const {
        setSelectedChatType,
        setSelectedChatData,
    } = useAppStore()

    // Debounced search function to avoid excessive API calls
    const debounce = (func, delay) => {
        let timeoutId
        return (...args) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }


    // Function to search contacts based on the input term
    const searchContacts = useCallback(async (searchTerm) => {
        try {
            setError(null)

            const trimmedTerm = searchTerm.trim();

            // Reset state if search term is empty
            if (trimmedTerm.length === 0) {
                setSearchedContacts([])
                setIsLoading(false)
                return
            }

            // Only search if the term is at least 2 characters long
            if (trimmedTerm.length < 2) {
                return;
            }

            // Set loading state
            setIsLoading(true)

            // Make API call to search contacts
            const response = await apiCLient.post(
                SEARCH_CONTACTS_ROUTE,
                { searchTerm: trimmedTerm },
                { withCredentials: true }
            )

            // Check if response is successful and contains contacts
            if (response.status === 200 && response.data.contacts) {
                setSearchedContacts(response.data.contacts)
            } else {
                setSearchedContacts([])
            }
        } catch (err) {
            // Handle errors and set error state
            console.error('Search contacts error:', err)
            setError('Failed to search contacts. Please try again.')
            setSearchedContacts([])
        } finally {
            // Reset loading state
            setIsLoading(false);
        }
    }, [])
    // limit the frequency of search calls using debounce
    const debouncedSearch = useCallback(debounce(searchContacts, 300), [searchContacts])


    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        debouncedSearch(value)
    }


    // Function to toggle the new contact modal
    // and reset search state when opening
    const handleOpenNewContactModal = () => {
        setOpenNewContactModal(prev => !prev)
        if (!openNewContactModal) {
            setSearchTerm('')
            setSearchedContacts([])
            setError(null)
            setIsLoading(false)
        }
    }

    // Function to select a contact from the search results
    const selectNewContact = (contact) => {

        // Close the modal and set selected chat type and data
        setOpenNewContactModal(false)
        setSelectedChatType("contact")
        setSelectedChatData(contact)

        // Reset search state
        setSearchTerm('')
        setSearchedContacts([])
        setError(null)
        setIsLoading(false)
    }

    // Helper functions to format contact display names and initials
    const getContactDisplayName = (contact) => {
        if (contact.firstName && contact.lastName) {
            return `${contact.firstName} ${contact.lastName}`
        }
        if (contact.firstName) {
            return contact.firstName
        }
        if (contact.lastName) {
            return contact.lastName
        }
        return contact.email
    }
    const getContactInitials = (contact) => {
        if (contact.firstName) {
            return contact.firstName.charAt(0).toUpperCase()
        }
        return contact.email.charAt(0).toUpperCase()
    }


    // Render different states based on search results
    const renderSearchState = () => {

        // Handle error state
        if (error) {
            return (
                <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <div className="text-red-500 text-center">
                        <p className="font-medium">Error</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )
        }

        // Handle loading state
        if (isLoading) {
            return (
                <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <Lottie
                        isClickToPauseDisabled={true}
                        height={150}
                        width={150}
                        options={animationDefaultOptionsChatLoading}
                    />
                    <div className="text-opacity-80 dark:text-white flex flex-col items-center text-lg transition-all duration-300 text-center mt-4">
                        <h4 className="font-medium">
                            Searching<span className="text-purple-500">...</span>
                        </h4>
                    </div>
                </div>
            )
        }

        // Handle empty search term state
        if (searchTerm.trim().length === 0) {
            return (
                <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <FaSearch className="text-4xl text-gray-400 mb-4" />
                    <div className="text-opacity-80 dark:text-white text-center">
                        <h4 className="font-medium text-lg">Search for contacts</h4>
                        <p className="text-sm mt-1 text-gray-500">Type at least 2 characters to search</p>
                    </div>
                </div>
            )
        }

        // Handle no contacts found state
        if (searchedContacts.length === 0 && searchTerm.trim().length >= 2) {
            return (
                <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <div className="text-opacity-80 dark:text-white text-center">
                        <h4 className="font-medium text-lg">No contacts found</h4>
                        <p className="text-sm mt-1 text-gray-500">
                            Try searching with a different term
                        </p>
                    </div>
                </div>
            )
        }

        return null
    }

    // Render the component UI
    // Includes the button to open the modal, search input, and contact list
    // Displays loading, error, and empty states as needed
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    {/* Button to open new contact modal */}
                    <TooltipTrigger asChild>
                        <button
                            className="text-slate-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={handleOpenNewContactModal}
                            aria-label="Start new conversation"
                        >
                            <FaPlus />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="dark:text-white font-light opacity-90 transition-all duration-300">
                        <p>Start new conversation</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Modal for searching and selecting contacts */}
            <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
                <DialogContent className="border-none dark:text-white w-full max-w-md h-[500px] flex flex-col transition-all duration-300">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-semibold">
                            Start New Conversation
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mb-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            <Input
                                placeholder="Search contacts by name or email..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-10 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Render search results or states */}
                    <div className="flex-1 min-h-0">
                        {renderSearchState()}

                        {searchedContacts.length > 0 && (
                            <ScrollArea className="h-full">
                                <div className="space-y-1">
                                    {searchedContacts.map((contact) => (
                                        <div
                                            key={contact._id}
                                            className="flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 gap-3 cursor-pointer p-3 rounded-lg transition-colors duration-200"
                                            onClick={() => selectNewContact(contact)}
                                        >
                                            <Avatar className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                                                {contact.image ? (
                                                    <AvatarImage
                                                        src={`${HOST}/${contact.image}`}
                                                        alt={`${getContactDisplayName(contact)} profile`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`uppercase h-10 w-10 text-sm border flex items-center justify-center rounded-full ${getColor(contact.color)}`}
                                                    >
                                                        {getContactInitials(contact)}
                                                    </div>
                                                )}
                                            </Avatar>

                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium truncate">
                                                    {getContactDisplayName(contact)}
                                                </span>
                                                <span className="text-xs text-gray-500 truncate">
                                                    {contact.email}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default NewDM