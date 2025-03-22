import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaPlus, FaTrash } from "react-icons/fa";
import { colors, getColor } from "../../lib/utils";
import { toast } from "sonner";
import apiCLient from "../../lib/api-client";
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE } from "../../utils/constants";
import { ModeToggle } from "../../components/ui/mode-toggle";
const ProfileIndex = () => {

  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);


  const validateProfile = () => {
    if (!firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiCLient.post(
          UPDATE_PROFILE_ROUTE,
          { firstName, lastName, color: selectedColor },
          { withCredentials: true }
        );

        if (response.status == 200 && response.data) {
          setUserInfo(response.data);
          toast.success("Profile updated successfully");
          navigate("/chat");
        }
      } catch (err) {
        console.log(err.message);
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);  
      if(userInfo.image){
        setImage(`${HOST}/${userInfo.image}`)
      }
     
          
    }
    
  }, [userInfo]);

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please setup profile")
    }
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);

      const response = await apiCLient.post(ADD_PROFILE_IMAGE_ROUTE,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

      if (response.status == 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Image updated successfully")
      }

    }

  }

  const handleDeleteImage = async () => {

    try{
      const respose = await apiCLient.delete(REMOVE_PROFILE_IMAGE_ROUTE,
        {withCredentials:true}
      );

      if(respose.status==200){
        setUserInfo({...userInfo, image:null});
        toast.success("Profile image removed successfully");
        setImage(null);
        
      }
    }catch(err){
      console.log(err.message);
      
    }

  }

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  }

  return (
    <>
      <div className="  h-[100vh] w-auto flex flex-col items-center justify-center ">
        <div className="flex  flex-col gap-1  border p-4 shadow-xl rounded-2xl  ">
          <div className="flex justify-between" >
            <IoArrowBack onClick={handleNavigate} className="text-4xl lg:text-6xl cursor-pointer " />
            <ModeToggle/>
          </div>
          <div className=" flex items-center flex-col gap-4 md:flex-row">
            <div
              className=" h-32 w-32 md:w-48 md:h-48 relative flex items-center justify-center "
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Avatar className=" h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden ">
                {image ? (
                  <AvatarImage
                    src={image}
                    alt="profile-image"
                    className=" object-cover w-full h-full "
                  />
                ) : (
                  <div
                    className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center ${getColor(
                      selectedColor
                    )} `}
                  >
                    {firstName
                      ? firstName.split("").shift()
                      : userInfo.email.split("").shift()}
                  </div>
                )}
              </Avatar>
              {hovered && (
                <div className=" absolute inset-0 flex items-center border  justify-center bg-black/50 ring-fuchsia-50 rounded-full "
                  onClick={image ? handleDeleteImage : handleFileInputClick}>
                  { image ? (
                    <FaTrash className="text-4xl text-white cursor-pointer" />
                  ) : (
                    <FaPlus className="text-4xl text-white cursor-pointer" />
                  )}
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} name="profile-image" accept=".png, .jpg, .jpeg, .svg, .webp" />
            </div>
            <div>
              <div className=" flex flex-col gap-5 items-center">
                <div className=" flex flex-col gap-4 ">
                  <input
                    placeholder="Email"
                    type="email"
                    disabled
                    value={userInfo.email}
                    className="rounded-lg p-5 border"
                  />
                
                  <input
                    placeholder="First Name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-lg dark:bg-slate-900 bg-slate-50 p-5 border"
                  />
                
                  <input
                    placeholder="Last Name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-lg p-4 dark:bg-slate-900 bg-slate-50 border"
                  />
                </div>

                <div className="flex gap-5">
                  {colors.map((color, index) => (
                    <div
                      className={` ${color} h-8 w-8 rounded-full hover:cursor-pointer transition-all duration-300
                  ${selectedColor === index ? "outline-white/50 outline-1" : ""
                        } `}
                      key={index}
                      onClick={() => setSelectedColor(index)}
                    ></div>
                  ))}
                </div>
                <button
                className="text-white font-semibold text-lg h-16 w-full bg-purple-600 hover:bg-purple-800 p-2 transition-all duration-300 rounded-lg"
                onClick={saveChanges}
              >
                Save Changes
              </button>
              </div>
              
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileIndex;

