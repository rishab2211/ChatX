import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../../../../../store'
import moment from "moment"
import apiCLient from '../../../../../../lib/api-client';
import { GET_ALL_MESSAGES_ROUTE, HOST } from '../../../../../../utils/constants';
import { MdFolderZip } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

const MessageContainer = () => {
  const scrollRef = useRef();
  const { selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {

    const getStoredMessages = async () => {
      try {

        // console.log("inside getStoredMessages");

        const response = await apiCLient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        // console.log("response hai yeh : "+response);


        if (response.data.storedMessages) {
          setSelectedChatMessages(response.data.storedMessages);
        }

      } catch (err) {
        console.log("something went wrong.")
      }
    }
    // console.log("yeh hai selected chat data id : "+selectedChatData._id);

    if (selectedChatData._id) {

      if (selectedChatType === "contact") {
        getStoredMessages();
      }
    }
  }, [selectedChatData, selectedChatType])

  const renderDMMessages = (message) => {
    return (
      <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
        {message.messageType === "text" && (
          <div className={`${message.sender !== selectedChatData._id
            ? "bg-[#8417ff]/5 dark:bg-[#8417ff]/5  text-[#8417ff]/90 dark:text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/10 text-black dark:text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%]`}>
            {message.content}
          </div>
        )}

        {
          message.messageType === "file" && (
            <div className={`${message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 dark:bg-[#8417ff]/5  text-[#8417ff]/90 dark:text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/10 text-black dark:text-white/80 border-[#ffffff]/20"
              } border inline-block p-4 rounded my-1 max-w-[50%]`}>

              {checkIfImage(message.fileUrl) ?
                <div className="cursor-pointer"
                  onClick={() => {
                    setShowImage(true);
                    setImageURL(message.fileUrl);
                  }}>
                  {<img src={`${HOST}/${message.fileUrl}`} width={300} height={300} />}
                </div> :
                <div className='flex justify-center items-center gap-4 '>
                  <div className='text-white/8 flex flex-col text-3xl rounded-full p-1 ' >
                    <div className='flex items-center justify-between' >
                      <MdFolderZip />
                      <div className=' w-fit rounded-full p-3 hover:bg-black/20 cursor-pointer transition-all duration-300  '
                        onClick={() => { downloadFile(message.fileUrl) }}>
                        <IoMdDownload />
                      </div>
                    </div>
                    <span>{message.fileUrl.split("/").pop()}</span>

                  </div>
                </div>
              }

            </div>
          )
        }
        <div className='text-xs text-gray-600'>
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    )
  }

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;

    return imageRegex.test(filePath);
  }

  const downloadFile = async (fileURL) => {
    try {

      console.log("file url :" + fileURL);

      const response = await apiCLient.get(`${HOST}/${fileURL}`,
        { responseType: "blob" }
      );

      console.log("response data : " + response.data);


      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      console.log("URL blob : " + urlBlob);


      const link = document.createElement("a");

      link.href = urlBlob;

      link.setAttribute("download", fileURL.split("/").pop());

      document.body.appendChild(link);

      link.click();
      link.remove();

      window.URL.revokeObjectURL(urlBlob)
    } catch (err) {
      console.log(err);

    }
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

      {
        showImage && (
          <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex justify-center items-center backdrop-blur-lg flex-col ' >
            <div>
              <img src={`${HOST}/${imageURL}`}
                className=' h-[80vh] w-full bg-cover '
              />
            </div>

            <div className='flex gap-5 top-0 mt-5  ' >
              <button className=' w-fit rounded-full p-1 hover:bg-black/20 cursor-pointer transition-all duration-300  '
                onClick={() => { downloadFile(imageURL) }}>
                <IoMdDownload className='text-2xl'/>
              </button>
            </div>

            <div className='flex gap-5 fixed top-0 mt-5  ' >
              <button className=' w-fit rounded-full  hover:bg-black/20 cursor-pointer transition-all duration-300  '
                onClick={() => { 
                  setShowImage(false);
                  setImageURL(null);
                 }}>
                  
                <IoMdClose className='text-2xl' />
              </button>
            </div>

          </div>
        )
      }
    </div>
  )
}

export default MessageContainer