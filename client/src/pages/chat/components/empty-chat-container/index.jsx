import React from 'react'
import Lottie from 'react-lottie';
import { animationDefaultOptions } from '../../../../lib/utils';

const EmptyChatContainer = () => {
    return (
        <div className=' flex-1 hidden md:flex flex-col justify-center items-center duration-1000 transition-all ' >
            <Lottie
            isClickToPauseDisabled={true}
            height={500}
            width={500}
            options={animationDefaultOptions}
            />
            <div className=' text-opacity-80 text-black dark:text-white flex flex-col  items-center  lg:text-4xl text-3xl transition-all duration-300 text-center  ' >
                <h3 className='poppins-medium' >
                    Hi<span className='text-purple-500' >!</span> Welcome to 
                    <span className='text-purple-500' > ChatX.</span>
                </h3>
            </div>
        </div>
    )
}

export default EmptyChatContainer;