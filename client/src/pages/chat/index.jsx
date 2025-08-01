import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ContactsContainer from './components/contacts-container';
import EmptyChatContainer from './components/empty-chat-container';
import ChatContainer from './components/chat-container';

const ChatIndex = () => {

  const { userInfo, selectedChatType } = useAppStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className='flex h-[100vh] w-[100vw] text-white overflow-hidden' >
      <ContactsContainer />
      {
        selectedChatType === undefined ? (<EmptyChatContainer />) : (<ChatContainer />)
      }
    </div>
  )
}

export default ChatIndex