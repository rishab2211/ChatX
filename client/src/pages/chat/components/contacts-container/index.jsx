import React, { useEffect } from 'react'
import Logo from '../../../../assets/Logo'
import ProfileInfo from './components/profileInfo'
import NewDM from './components/new-dm'
import { ModeToggle } from '../../../../components/ui/mode-toggle'
import { useAppStore } from '../../../../store'
import apiCLient from '../../../../lib/api-client'
import { GET_CONTACTS_ROUTES, GET_USER_CHANNELS } from '../../../../utils/constants'
import ContactList from '../../../../components/ui/contact-list'
import CreateChannel from './components/create-channel'

const ContactsContainer = () => {
  const { selectedChatType, directMessagesContacts, setDirectMessagesContacts, channels, setChannels } = useAppStore();

  const containerVisibility = selectedChatType === undefined
    ? 'w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw]'
    : ' md:block  hidden md:w-[35vw] lg:w-[30vw] xl:w-[20vw]';

  useEffect(() => {
    const getContacts = async () => {
      const response = await apiCLient.get(
        GET_CONTACTS_ROUTES,
        { withCredentials: true }
      );

      if (response.data.contacts) {
        setDirectMessagesContacts(response.data.contacts)
      }
    }

    const getUserChannels = async () => {
      const response = await apiCLient.get(
        GET_USER_CHANNELS,
        { withCredentials: true }
      );

      console.log(response.data.channels);


      if (response.data.channels) {
        setChannels(response.data.channels);
      }
    }


    getContacts();
    getUserChannels();
  }, [])

  return (
    <div className={`relative w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw] border-r-2 border-[#2f303b] ${containerVisibility} `}>
      <div className='pt-3 pr-3 flex justify-between items-center'>
        <Logo />
        <ModeToggle />
      </div>
      <div className='my-5'>
        <div className='flex items-center justify-between pr-10'>
          <Title text="Direct messages" />
          <NewDM />
        </div>
        <div className=' max-h-[38vh] overflow-y-auto scrollbar-hidden ' >
          <ContactList contacts={directMessagesContacts} />
        </div>
      </div>
      <div className='my-5'>
        <div className='flex items-center justify-between pr-10'>
          <Title text="channels" />
          <CreateChannel />
        </div>
        <div className=' max-h-[38vh] dark:text-white overflow-y-auto scrollbar-hidden ' >
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  )
}

const Title = ({ text }) => {
  return (
    <h6 className='uppercase tracking-widest text-black dark:text-neutral-300 pl-10 font-light text-sm'>
      {text}
    </h6>
  )
}
export default ContactsContainer