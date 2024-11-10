import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ChatIndex = () => {

  const {userInfo} = useAppStore();

  const navigate = useNavigate();

  useEffect(()=>{
    if(!userInfo.profileSetup){
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  },[userInfo, navigate]);


  return (
    <div>ChatIndex</div>
  )
}

export default ChatIndex