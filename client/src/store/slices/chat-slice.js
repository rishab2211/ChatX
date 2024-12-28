
export const createChatSlice =(set,get)=>({
    selectedChatType : undefined,
    selectedChatData : undefined,
    selectedChatMessages : [],
    setSelectedChatType : (selectedChatType)=>set({selectedChatType}),
    setSelectedChatData : (selectedChatData)=>set({selectedChatData}),
    setSelectedChatMessages: (selectedChatMessages)=>set({selectedChatMessages}),
    closeChat : ()=>set({selectedChatType:undefined,
         selectedChatData:undefined }),
    addMessage: (message)=>{
        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set({
            selectedChatMessages: [
                ...selectedChatMessages,{
                    ...message,
                    recipient: selectedChatType==="channel"
                    ?message.recipient
                    :message.recipient._id,
                    messageTypes: message.messageTypes || "text", // Fallback to "text"
                    content: message.content || "", // Ensure content is provided
                    fileUrl: message.fileUrl || null,
                }
            ]
        })
    }
})