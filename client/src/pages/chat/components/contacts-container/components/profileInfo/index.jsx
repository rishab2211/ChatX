import React, { useEffect } from 'react'
import { useAppStore } from '../../../../../../store'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { HOST, LOGOUT_ROUTE } from '../../../../../../utils/constants';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { IoPowerSharp} from "react-icons/io5"
import apiCLient from '../../../../../../lib/api-client';
import { getColor } from '../../../../../../lib/utils';


const ProfileInfo = () => {

    const { userInfo, setUserInfo } = useAppStore();
    const navigate =  useNavigate();

    const logOut = async ()=>{
        try{
            const response = await apiCLient.post(LOGOUT_ROUTE,
                {},
                {withCredentials:true}
            )

            if(response.status===200){
                navigate("/auth");
                setUserInfo(null);
            }
            localStorage.setItem("vite-ui-theme","light");
        }catch(err){
            console.log(err.message)
        }
    }


    return (
        <div className='absolute bottom-0 flex items-center justify-between border border-t-[#2f303b]  px-10 py-3 w-full  ' >
            <div className=' flex gap-3 items-center justify-center  ' >
                <div className=' w-12 h-12 relative ' >
                    <Avatar className=" h-12 w-12 rounded-full overflow-hidden ">
                        {userInfo.image ? (
                            <AvatarImage
                                src={`${HOST}/${userInfo.image}`}
                                alt="profile-image"
                                className=" object-cover w-full h-full "
                            />
                        ) : (
                                                <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <div
                                className={`uppercase h-12 w-12 text-lg border-[1px] flex
                                     items-center justify-center ${getColor(userInfo.color)} `}
                            >
                                {userInfo.firstName
                                    ? userInfo.firstName.split("").shift()
                                    : userInfo.email.split("").shift()}
                            </div>
                            </TooltipTrigger>
                            <TooltipContent className="" >
                                <p>If the profile image not loaded refresh again</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                        )}
                    </Avatar>
                </div>
                <div className=' text-black dark:text-white  ' >
                    {
                        userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : ""
                    }
                </div>
                <div className=' flex gap-5 ' >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <FiEdit2 className=" text-purple-500 text-3xl  p-1 "
                                onClick={()=>navigate("/profile")} />
                            </TooltipTrigger>
                            <TooltipContent className="" >
                                <p>Edit Profile</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <IoPowerSharp className=" text-red-500 text-3xl  p-1 "
                                onClick={logOut} />
                            </TooltipTrigger>
                            <TooltipContent className="" >
                                <p>Logout</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>
            </div>
        </div>
    )
}

export default ProfileInfo