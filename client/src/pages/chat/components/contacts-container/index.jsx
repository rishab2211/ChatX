import React from 'react'
import Logo from '../../../../assets/Logo'

const ContactsContainer = () => {
  return (
    <div className='relative w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b]  ' >
        <div className='pt-3' >
            <Logo/>
        </div>
        <div className=' my-5 ' >
            <div className='flex items-center justify-between pr-10 ' >
                <Title text={"Direct messages"} />
            </div>
        </div>
        <div className=' my-5 ' >
            <div className='flex items-center justify-between pr-10 ' >
                <Title text={"channels"} />
            </div>
        </div>
    </div>
  )
}

export default ContactsContainer

const Title  = ({text})=>{
    return (
        <h6 className='uppercase tracking-widest text-neutral-400 pl-10 font-light text-sm  ' >
            {text}
        </h6>
    )
}