import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useAppStore } from '../../../../../../store'
import moment from "moment"
import apiClient from '../../../../../../lib/api-client'
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from '../../../../../../utils/constants'
import { MdFolderZip, MdImage, MdPictureAsPdf, MdDescription } from "react-icons/md"
import { IoMdDownload, IoMdClose } from "react-icons/io"
import { FaSpinner } from "react-icons/fa"
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../../components/ui/avatar'
import { getColor } from '../../../../../../lib/utils'

const MessageContainer = () => {
  const scrollRef = useRef()
  const imageModalRef = useRef()
  
  const { 
    selectedChatType, 
    selectedChatData, 
    userInfo, 
    selectedChatMessages, 
    setSelectedChatMessages 
  } = useAppStore()
  
  const [showImage, setShowImage] = useState(false)
  const [imageURL, setImageURL] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloadingFiles, setDownloadingFiles] = useState(new Set())

  // Memoized file type checker
  const checkIfImage = useCallback((filePath) => {
    if (!filePath) return false
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i
    return imageRegex.test(filePath)
  }, [])

  // Get file icon based on file type
  const getFileIcon = useCallback((filePath) => {
    if (!filePath) return <MdFolderZip />
    
    const extension = filePath.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return <MdPictureAsPdf />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <MdImage />
      case 'doc':
      case 'docx':
      case 'txt':
        return <MdDescription />
      default:
        return <MdFolderZip />
    }
  }, [])

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return ''
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Enhanced download function with better error handling
  const downloadFile = useCallback(async (fileURL) => {
    if (!fileURL) return
    
    const fileName = fileURL.split("/").pop()
    setDownloadingFiles(prev => new Set([...prev, fileURL]))

    try {
      const response = await apiClient.get(`${HOST}/${fileURL}`, {
        responseType: "blob",
        timeout: 30000 // 30 second timeout
      })

      const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      
      link.href = urlBlob
      link.download = fileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(urlBlob)
      }, 100)
      
    } catch (err) {
      console.error('Download failed:', err)
      setError(`Failed to download ${fileName}`)
      setTimeout(() => setError(null), 3000)
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileURL)
        return newSet
      })
    }
  }, [])

  // Enhanced image modal handlers
  const handleImageClick = useCallback((imageUrl) => {
    setImageURL(imageUrl)
    setShowImage(true)
    document.body.style.overflow = 'hidden' // Prevent background scroll
  }, [])

  const handleCloseImage = useCallback(() => {
    setShowImage(false)
    setImageURL(null)
    document.body.style.overflow = 'unset' // Restore scroll
  }, [])

  // Keyboard event handler for image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showImage && event.key === 'Escape') {
        handleCloseImage()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showImage, handleCloseImage])

  // Enhanced message fetching with better error handling
  const fetchMessages = useCallback(async () => {
    if (!selectedChatData?._id) return

    setIsLoading(true)
    setError(null)

    try {
      let response

      if (selectedChatType === "contact") {
        response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        )
        
        if (response.data.storedMessages) {
          setSelectedChatMessages(response.data.storedMessages)
        }
      } else if (selectedChatType === "channel") {
        response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        )
        
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages)
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('Failed to load messages. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Get contact display name
  const getContactDisplayName = useCallback((contact) => {
    if (!contact) return ''
    
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`
    }
    if (contact.firstName) return contact.firstName
    if (contact.lastName) return contact.lastName
    return contact.email || 'Unknown User'
  }, [])

  // Get contact initials
  const getContactInitials = useCallback((contact) => {
    if (!contact) return '?'
    
    if (contact.firstName) {
      return contact.firstName.charAt(0).toUpperCase()
    }
    return (contact.email || '?').charAt(0).toUpperCase()
  }, [])

  // Enhanced DM message renderer
  const renderDMMessages = useCallback((message) => {
    const isOwnMessage = message.sender !== selectedChatData._id
    const isDownloading = downloadingFiles.has(message.fileUrl)

    return (
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}>
        <div className="max-w-[70%] sm:max-w-[60%] md:max-w-[50%]">
          {message.messageType === "text" && (
            <div className={`${
              isOwnMessage
                ? "bg-[#8417ff]/10 text-[#8417ff] border-[#8417ff]/30"
                : "bg-gray-100 dark:bg-[#2a2b33] text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
            } border rounded-2xl px-4 py-2 shadow-sm`}>
              <p className="break-words">{message.content}</p>
            </div>
          )}

          {message.messageType === "file" && (
            <div className={`${
              isOwnMessage
                ? "bg-[#8417ff]/10 text-[#8417ff] border-[#8417ff]/30"
                : "bg-gray-100 dark:bg-[#2a2b33] text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
            } border rounded-2xl p-3 shadow-sm`}>
              {checkIfImage(message.fileUrl) ? (
                <div 
                  className="cursor-pointer group relative overflow-hidden rounded-lg"
                  onClick={() => handleImageClick(message.fileUrl)}
                >
                  <img 
                    src={`${HOST}/${message.fileUrl}`} 
                    className="max-w-full h-auto object-cover transition-transform duration-200 group-hover:scale-105" 
                    alt="Shared image"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <MdImage className="text-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getFileIcon(message.fileUrl)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {message.fileUrl.split("/").pop()}
                    </p>
                  </div>
                  <button
                    className="flex-shrink-0 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => downloadFile(message.fileUrl)}
                    disabled={isDownloading}
                    title="Download file"
                  >
                    {isDownloading ? (
                      <FaSpinner className="animate-spin text-lg" />
                    ) : (
                      <IoMdDownload className="text-lg" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    )
  }, [selectedChatData._id, downloadingFiles, checkIfImage, handleImageClick, getFileIcon, downloadFile])

  // Enhanced channel message renderer
  const renderChannelMessages = useCallback((message) => {
    const isOwnMessage = message.sender._id === userInfo.id
    const isDownloading = downloadingFiles.has(message.fileUrl)

    return (
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
        <div className="max-w-[70%] sm:max-w-[60%] md:max-w-[50%]">
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1 ml-1">
              <Avatar className="h-6 w-6">
                {message.sender.image ? (
                  <AvatarImage
                    src={`${HOST}/${message.sender.image}`}
                    alt={getContactDisplayName(message.sender)}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback
                    className={`text-xs ${getColor(message.sender.color)}`}
                  >
                    {getContactInitials(message.sender)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getContactDisplayName(message.sender)}
              </span>
            </div>
          )}

          {message.messageType === "text" && (
            <div className={`${
              isOwnMessage
                ? "bg-[#8417ff]/10 text-[#8417ff] border-[#8417ff]/30"
                : "bg-gray-100 dark:bg-[#2a2b33] text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
            } border rounded-2xl px-4 py-2 shadow-sm`}>
              <p className="break-words">{message.content}</p>
            </div>
          )}

          {message.messageType === "file" && (
            <div className={`${
              isOwnMessage
                ? "bg-[#8417ff]/10 text-[#8417ff] border-[#8417ff]/30"
                : "bg-gray-100 dark:bg-[#2a2b33] text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
            } border rounded-2xl p-3 shadow-sm`}>
              {checkIfImage(message.fileUrl) ? (
                <div 
                  className="cursor-pointer group relative overflow-hidden rounded-lg"
                  onClick={() => handleImageClick(message.fileUrl)}
                >
                  <img 
                    src={`${HOST}/${message.fileUrl}`} 
                    className="max-w-full h-auto object-cover transition-transform duration-200 group-hover:scale-105" 
                    alt="Shared image"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <MdImage className="text-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getFileIcon(message.fileUrl)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {message.fileUrl.split("/").pop()}
                    </p>
                  </div>
                  <button
                    className="flex-shrink-0 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => downloadFile(message.fileUrl)}
                    disabled={isDownloading}
                    title="Download file"
                  >
                    {isDownloading ? (
                      <FaSpinner className="animate-spin text-lg" />
                    ) : (
                      <IoMdDownload className="text-lg" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      </div>
    )
  }, [userInfo.id, downloadingFiles, checkIfImage, handleImageClick, getFileIcon, downloadFile, getContactDisplayName, getContactInitials])

  // Memoized message rendering with date separators
  const renderedMessages = useMemo(() => {
    if (!selectedChatMessages.length) return null

    let lastDate = null
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD")
      const showDate = messageDate !== lastDate
      lastDate = messageDate

      return (
        <div key={message._id || index}>
          {showDate && (
            <div className="flex justify-center my-6">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
                {moment(message.timestamp).format("MMMM D, YYYY")}
              </div>
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      )
    })
  }, [selectedChatMessages, selectedChatType, renderDMMessages, renderChannelMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedChatMessages])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-3xl text-[#8417ff]" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={fetchMessages}
            className="px-4 py-2 bg-[#8417ff] text-white rounded-lg hover:bg-[#8417ff]/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {selectedChatMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          renderedMessages
        )}
        <div ref={scrollRef} />
      </div>

      {/* Enhanced Image Modal */}
      {showImage && imageURL && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseImage}
          ref={imageModalRef}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img 
              src={`${HOST}/${imageURL}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              alt="Preview"
            />
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
                onClick={() => downloadFile(imageURL)}
                title="Download image"
              >
                {downloadingFiles.has(imageURL) ? (
                  <FaSpinner className="animate-spin text-white text-xl" />
                ) : (
                  <IoMdDownload className="text-white text-xl" />
                )}
              </button>
              <button
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
                onClick={handleCloseImage}
                title="Close"
              >
                <IoMdClose className="text-white text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageContainer