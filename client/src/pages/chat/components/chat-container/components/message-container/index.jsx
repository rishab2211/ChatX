import React, { useEffect, useRef } from 'react'
import { useAppStore } from '../../../../../../store'
import moment from "moment"
import apiCLient from '../../../../../../lib/api-client';
import { GET_ALL_MESSAGES_ROUTE } from '../../../../../../utils/constants';

const MessageContainer = () => {
  const scrollRef = useRef();
  const { selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages } = useAppStore();

  useEffect(()=>{

    const getStoredMessages = async()=>{
      try{

        console.log("inside getStoredMessages");
        
        const response = await apiCLient.post(
          GET_ALL_MESSAGES_ROUTE,
          {id:selectedChatData._id},
          {withCredentials: true}
        );

        console.log("response hai yeh : "+response);
        

        if(response.data.storedMessages){
          setSelectedChatMessages(response.data.storedMessages);
        }

      }catch(err){
        console.log("something went wrong.")
      }
    }
    console.log("yeh hai selected chat data id : "+selectedChatData._id);
    
    if(selectedChatData._id){

      if(selectedChatType==="contact"){
        getStoredMessages();
      }
    }
  },[selectedChatData,selectedChatType])

  const renderDMMessages = (message) => {
    return (
      <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
        {message.messageType === "text" && (
          <div className={`${
            message.sender !== selectedChatData._id 
              ? "bg-[#8417ff]/5 dark:bg-[#8417ff]/5  text-[#8417ff]/90 dark:text-[#8417ff]/90 border-[#8417ff]/50" 
              : "bg-[#2a2b33]/10 text-black dark:text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%]`}>
            {message.content}
          </div>
        )}
        <div className='text-xs text-gray-600'>
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    )
  }

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className='text-center text-gray-500 my-2'>
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
        </div>
      )
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedChatMessages])

  return (
    <div className='flex-1 text-black dark:text-white overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'>
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  )
}

export default MessageContainer