import React, { useState } from "react";
import ChatIcon from "../../assets/ChatIcon.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "../../lib/api-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";

const AuthIndex = () => {
  // Email state manage
  const [email, setEmail] = useState("");
  // Password state manage
  const [password, setPassword] = useState("");
  // Confirm password state manage
  const [confirmPassword, setConfirmPassword] = useState("");

  // useNavigate instance 
  const navigate = useNavigate();

  const {setUserInfo} = useAppStore();

  // Validating signup and responding accordingly with toast notification
  const validateSignup = () => {
    // if email and password field is empty
    if (!email.length && !password.length) {
      // Toast Notification
      toast.error("Email & Password is requried");
      return false;
    }
    // if email field is empty
    if (!email.length) {
      toast.error("Email is requried");
      return false;
    }
    // if password field is empty
    if (!password.length) {
      toast.error("Password is requried");
      return false;
    }
    // if password and confirm password are not same
    if (password != confirmPassword) {
      toast.error("Password and Confirm password should be same");
      return false;
    }
    return true;
  };

  // Validating signup and responding accordingly with toast notification
  const validateLogin = () => {
    // if email and password field is empty
    if (!email.length && !password.length) {
      // Toast Notification
      toast.error("Email & Password is requried");
      return false;
    }
    // if email field is empty
    if (!email.length) {
      toast.error("Email is requried");
      return false;
    }
    // if password field is empty
    if (!password.length) {
      toast.error("Password is requried");
      return false;
    }
    return true;
  };

  // fn used when everytime user clicks login or signup tab button then it refeshes all the fields
  function Ready(){
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };



  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const response = await apiClient.post(
          // If validation is successful then, sending POST request to this route
          SIGNUP_ROUTE,
          // Data
          { email, password },
          // Ensures cookies are included in the request
          { withCredentials: true }
        );
        // notification on succsessful login
        toast.success("Signup successful");
        // Clear input fields
        Ready();

        if(response.status===201){
          setUserInfo(response.data.user)
          navigate("/profile");
        }
      } catch (error) {
        // showing error mesage as toast notification
        toast.error(error.message);
      }
    }
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          // If validation is successful then, sending POST request to this route
          LOGIN_ROUTE,
          // Data
          { email, password },
          // Ensures cookies are included in the request
          { withCredentials: true }
        );
        // notification on succsessful login
        toast.success("Login successful");
        // Clear input fields
        Ready();

        console.log("RESPONSE DATA : "+response.data);
        console.log("RESPONSE DATA USER : "+response.data.user);

        console.log("RESPONSE DATA USER EMAIL : "+response.data.user.email);
        console.log("RESPONSE DATA USER ID : "+response.data.user.id);
        console.log("RESPONSE DATA USER PROFILESETUP : "+response.data.user.profileSetup);
        
        
        if(response.data.user){
          setUserInfo(response.data.user);
          if(response.data.user.profileSetup){
            navigate("/chat");
          }else{
            navigate("/profile");
          }
        }
      } catch (error) {
        // showing error mesage as toast notification
        toast.error(error.message);
      }
    }
  };

  return (
    // main outer div
    <div className=" h-[100vh] w-[100vw] flex items-center justify-center ">
      {/* // container div containing all the fields, buttons, texts */}
      <div className=" h-[80vh] bg-white border-2 border-slate-200 text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] rounded-3xl p-2 grid xl:grid-cols-2">
        {/* Upper texts and icon div */}
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center justify-center">
            <h1 className=" text-4xl font-bold md:text-6xl ">Welcome</h1>
            <img src={ChatIcon} alt="Chat icon" className="w-16" />
          </div>
          <p className="text-xl ">Fill in the details to start a Chat!</p>
        </div>

        {/* main fields and buttons div  */}
        <div className=" flex items-center justify-center w-full ">
          {/* login and signup tabs div */}
          <Tabs className="w-3/4" defaultValue="login">
            <TabsList className={`bg-transparent rounded-none w-full`}>
              {/* login tab */}
              <TabsTrigger
                value="login"
                className={` data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500  w-full p-3 transition-all duration-300 `}
                onClick={Ready}
              >
                Login
              </TabsTrigger>

              {/* Signup tab */}
              <TabsTrigger
                value="signup"
                className={` data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500  w-full p-3 transition-all duration-300 `}
                onClick={Ready}
              >
                Signup
              </TabsTrigger>
            </TabsList>

            {/* Login tab fields and button */}
            <TabsContent className="flex flex-col gap-5 m-10" value="login">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full p-6 "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button className="rounded-full p-6" onClick={handleLogin}>
                Login
              </Button>
            </TabsContent>

            {/* Signup tab fields and button */}
            <TabsContent className="flex flex-col gap-5 m-10" value="signup">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="text"
                className="rounded-full p-6 "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="rounded-full p-6 "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button className="rounded-full p-6" onClick={handleSignup}>
                Signup
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthIndex;
