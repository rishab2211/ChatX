import { useEffect, useRef, useState, useCallback } from 'react'
import { GrAttachment } from "react-icons/gr"
import { IoSend } from 'react-icons/io5'
import { RiEmojiStickerLine } from 'react-icons/ri'
import { FaSpinner, FaTimes, FaImage, FaFile } from 'react-icons/fa'
import EmojiPicker from "emoji-picker-react"
import { useAppStore } from '../../../../../../store'
import { useSocket } from '../../../../../../socketContext/SocketContext'
import { UPLOAD_FILES_ROUTE } from '../../../../../../utils/constants'
import apiCLient from '../../../../../../lib/api-client'

const MessageBar = () => {
    const [message, setMessage] = useState("")
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError] = useState(null)
    
    const emojiRef = useRef()
    const fileInputRef = useRef()
    const messageInputRef = useRef()
    
    const socket = useSocket()
    const { selectedChatType, selectedChatData, userInfo } = useAppStore()

    // File type validation
    const allowedFileTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        text: ['text/plain'],
        archive: ['application/zip', 'application/x-rar-compressed']
    }

    const maxFileSize = 10 * 1024 * 1024 // 10MB

    // Enhanced emoji picker click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current &&
                !emojiRef.current.contains(event.target) &&
                !event.target.closest('.EmojiPickerReact')) {
                setEmojiPickerOpen(false)
            }
        }

        if (emojiPickerOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [emojiPickerOpen])

    // Clear error after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [error])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Send message on Enter (but not Shift+Enter)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSendMessage()
            }
            
            // Close emoji picker on Escape
            if (event.key === 'Escape' && emojiPickerOpen) {
                setEmojiPickerOpen(false)
            }
        }

        const inputElement = messageInputRef.current
        if (inputElement) {
            inputElement.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            if (inputElement) {
                inputElement.removeEventListener('keydown', handleKeyDown)
            }
        }
    }, [message, emojiPickerOpen])

    // Validate file type and size
    const validateFile = useCallback((file) => {
        if (!file) return { valid: false, error: 'No file selected' }

        // Check file size
        if (file.size > maxFileSize) {
            return {
                valid: false,
                error: `File size must be less than ${maxFileSize / (1024 * 1024)}MB`
            }
        }

        // Check file type
        const isValidType = Object.values(allowedFileTypes).flat().includes(file.type)
        if (!isValidType) {
            return {
                valid: false,
                error: 'File type not supported. Please use images, documents, or text files.'
            }
        }

        return { valid: true }
    }, [])

    // Get file preview
    const getFilePreview = useCallback((file) => {
        if (!file) return null

        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file)
        }
        return null
    }, [])

    // Format file size
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }, [])

    // Enhanced emoji handler
    const handleAddEmoji = useCallback((emoji) => {

        // Insert emoji at cursor position
        const input = messageInputRef.current

        // If input is focused, insert emoji at cursor position
        // Otherwise, append to the end of the message
        if (!input) return
        if (input) {
        
            // Get the starting and ending index of the user's text cursor or selection
            // If no text is selected, start and end will be the same.
            const start = input.selectionStart
            const end = input.selectionEnd          
            

            // Insert emoji at cursor position
            const newMessage = message.slice(0, start) + emoji.emoji + message.slice(end)
            setMessage(newMessage)
            
            // Restore cursor position
            setTimeout(() => {
                // Set cursor position after emoji insertion
                input.selectionStart = input.selectionEnd = start + emoji.emoji.length
                input.focus()
            }, 0)
        } else {
            // If input is not focused, just append emoji to the message
            setMessage(prev => prev + emoji.emoji)
        }
    }, [message])

    // Enhanced send message function
    const handleSendMessage = useCallback(async () => {
        const trimmedMessage = message.trim()
        
        if (!trimmedMessage && !selectedFile) {
            setError('Please enter a message or select a file')
            return
        }

        if (!selectedChatData?._id) {
            setError('No chat selected')
            return
        }

        try {
            // Send file if selected
            if (selectedFile) {
                await handleFileUpload(selectedFile)
                return
            }

            // Send text message
            const messageData = {
                sender: userInfo.id,
                content: trimmedMessage,
                messageType: "text",
                fileUrl: undefined
            }

            if (selectedChatType === "contact") {
                socket.emit("sendMessage", {
                    ...messageData,
                    recipient: selectedChatData._id
                })
            } else if (selectedChatType === "channel") {
                socket.emit("send-channel-message", {
                    ...messageData,
                    channelId: selectedChatData._id
                })
            }

            setMessage("")
            if (messageInputRef.current) {
                messageInputRef.current.focus()
            }
        } catch (err) {
            console.error('Send message error:', err)
            setError('Failed to send message')
        }
    }, [message, selectedFile, selectedChatData, selectedChatType, userInfo.id, socket])

    // Toggle emoji picker
    const toggleEmojiPicker = useCallback((e) => {
        e.stopPropagation()
        setEmojiPickerOpen(prev => !prev)
    }, [])

    // Handle attachment click
    const handleAttachmentClick = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }, [])

    // Enhanced file upload with progress
    const handleFileUpload = useCallback(async (file) => {

        // Validate file before upload
        const validation = validateFile(file)
        if (!validation.valid) {
            // If validation fails, set error and return
            setError(validation.error)
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {

            // Create FormData for file upload
            const formData = new FormData()
            formData.append("file", file)

            // Send file to server
            const response = await apiCLient.post(UPLOAD_FILES_ROUTE, formData, {
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    setUploadProgress(progress)
                }
            })

            // If upload is successful, emit message to socket
            if (response.status === 200 && response.data) {

                // Prepare message data
                const messageData = {
                    sender: userInfo.id,
                    content: undefined,
                    messageType: "file",
                    fileUrl: response.data.filePath
                }

                // Emit message based on selected chat type
                if (selectedChatType === "contact") {
                    socket.emit("sendMessage", {
                        ...messageData,
                        recipient: selectedChatData._id
                    })
                } else if (selectedChatType === "channel") {
                    socket.emit("send-channel-message", {
                        ...messageData,
                        channelId: selectedChatData._id
                    })
                }

                // Clear selected file
                setSelectedFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            }
        } catch (err) {
            console.error('File upload error:', err)
            setError('Failed to upload file')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }, [validateFile, selectedChatType, selectedChatData, userInfo.id, socket])

    // Handle file selection
    const handleAttachmentChange = useCallback(async (event) => {
        const file = event.target.files[0]
        if (file) {
            const validation = validateFile(file)
            if (!validation.valid) {
                setError(validation.error)
                event.target.value = '' // Clear the input
                return
            }
            setSelectedFile(file)
        }
    }, [validateFile])

    // Remove selected file
    const removeSelectedFile = useCallback(() => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [])




    // Check if send button should be disabled
    const isSendDisabled = !message.trim() && !selectedFile

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Error Display */}
            {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* File Preview */}
            {selectedFile && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {selectedFile.type.startsWith('image/') ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    <img
                                        src={getFilePreview(selectedFile)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <FaFile className="text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                        <button
                            onClick={removeSelectedFile}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FaTimes className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-3">
                        <FaSpinner className="animate-spin text-blue-600" />
                        <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">{uploadProgress}%</span>
                    </div>
                </div>
            )}

            {/* Main Input Area */}
            <div className="px-4 py-3">
                <div className="flex items-end gap-3">
                    {/* Message Input */}
                    <div className="flex-1 relative">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
                            <textarea
                                ref={messageInputRef}
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[44px] max-h-32"
                                rows={1}
                                style={{
                                    height: 'auto',
                                    minHeight: '44px',
                                    maxHeight: '128px'
                                }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                                }}
                                disabled={isUploading}
                            />
                        </div>

                        {/* Emoji Picker */}
                        <div className="absolute bottom-full right-0 mb-2">
                            <EmojiPicker
                                open={emojiPickerOpen}
                                onEmojiClick={handleAddEmoji}
                                theme="auto"
                                lazyLoadEmojis={true}
                                searchDisabled={false}
                                skinTonesDisabled={false}
                                width={300}
                                height={400}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        {/* File Attachment */}
                        <button
                            onClick={handleAttachmentClick}
                            disabled={isUploading}
                            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                            title="Attach file"
                        >
                            <GrAttachment className="text-xl" />
                        </button>

                        {/* Emoji Picker Toggle */}
                        <button
                            ref={emojiRef}
                            onClick={toggleEmojiPicker}
                            disabled={isUploading}
                            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-yellow-500 hover:text-yellow-600 transition-colors disabled:opacity-50"
                            title="Add emoji"
                        >
                            <RiEmojiStickerLine className="text-xl" />
                        </button>


                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={isSendDisabled || isUploading}
                            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors disabled:opacity-50"
                            title="Send message"
                        >
                            {isUploading ? (
                                <FaSpinner className="animate-spin text-xl" />
                            ) : (
                                <IoSend className="text-xl" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAttachmentChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />
        </div>
    )
}

export default MessageBar