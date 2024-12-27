import React from 'react'
import Logo from '../../../../assets/Logo'
import ProfileInfo from './components/profileInfo'
import NewDM from './components/new-dm'
import { ModeToggle } from '../../../../components/ui/mode-toggle'
import { useAppStore } from '../../../../store'
// 
const ContactsContainer = () => {
  const { selectedChatType } = useAppStore();
// 
  const containerVisibility = selectedChatType === undefined 
    ? 'w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw]'
    : ' md:block  hidden md:w-[35vw] lg:w-[30vw] xl:w-[20vw]';

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
      </div>
      <div className='my-5'>
        <div className='flex items-center justify-between pr-10'>
          <Title text="channels" />
        </div>
      </div>
      <ProfileInfo />
    </div>
  )
}
// 
const Title = ({ text }) => {
  return (
    <h6 className='uppercase tracking-widest text-black dark:text-neutral-300 pl-10 font-light text-sm'>
      {text}
    </h6>
  )
}
// 
export default ContactsContainer
// 




// import React from 'react'
// import Logo from '../../../../assets/Logo'
// import ProfileInfo from './components/profileInfo'
// import NewDM from './components/new-dm'
// import { ModeToggle } from '../../../../components/ui/mode-toggle'

// const ContactsContainer = () => {
//   return (
//     <div className={`relative w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw] border-r-2 border-[#2f303b] ${selected} `} >
//         <div className='pt-3 pr-3 flex justify-between items-center' >
//             <Logo/>
//             <ModeToggle/>
//         </div>
//         <div className='my-5'>
//             <div className='flex items-center justify-between pr-10'>
//                 <Title text={"Direct messages"}/>
//                 <NewDM/>
//             </div>
//         </div>
//         <div className='my-5'>
//             <div className='flex items-center justify-between pr-10'>
//                 <Title text={"channels"}/>
//             </div>
//         </div>
//         <ProfileInfo/>
//     </div>
//   )
// }

// export default ContactsContainer

// const Title = ({text}) => {
//     return (
//         <h6 className='uppercase tracking-widest text-black dark:text-neutral-300 pl-10 font-light text-sm'>
//             {text}
//         </h6>
//     )
// }