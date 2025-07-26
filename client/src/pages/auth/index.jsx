import React, { useEffect, useState } from "react";
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
  // Email and password state variables for signup and login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Using useNavigate hook from react-router-dom to navigate between routes
  const navigate = useNavigate();

  // Using useAppStore to manage global state for user information
  const { userInfo, setUserInfo } = useAppStore();


  // Function to reset the input fields
  // This function clears the email, password, and confirm password fields
  function Ready() {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // Function to validate signup form inputs
  const validateSignup = () => {
    // if email and password field is empty
    if (!email.length && !password.length) {
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

    // if all fields are filled correctly then return true
    return true;
  };

  // Function to handle signup
  const handleSignup = async () => {

    // Validating signup and responding accordingly with toast notification
    if (validateSignup()) {
      try {

        // POST request to the SIGNUP_ROUTE with email and password
        // withCredentials: true ensures that cookies are included in the request
        const response = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true }
        );

        // notification on successful signup
        toast.success("Signup successful");

        // Clear input fields
        Ready();

        // If the response is successful and contains user data, navigate to profile page
        if (response.status === 201) {
          setUserInfo(response.data.user)
          navigate("/profile");
        }

      } catch (error) {
        // error message as toast notification if validation fails
        toast.error(error.message);
      }
    }
  };


  // Function to validate login form inputs
  // This function checks if the email and password fields are filled correctly
  const validateLogin = () => {
    // if email and password field is empty
    if (!email.length && !password.length) {
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

    // if all fields are filled correctly then return true
    return true;
  };

  const handleLogin = async () => {

    // Validating login and responding accordingly with toast notification
    // If validation is successful then, sending POST request to LOGIN_ROUTE with email and password
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          // Endpoint for login
          LOGIN_ROUTE,
          // Data
          { email, password },
          // Ensures cookies are included in the request
          { withCredentials: true }
        );


        // If the response is successful and contains user data, set user info and navigate to chat or profile page
        // If the user has completed profile setup, navigate to chat page, otherwise navigate to profile
        if (response.status === 200 && response.data.user) { 
          toast.success("Login successful");

          setUserInfo(response.data.user);
          if (response.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }

        // Clear input fields
        Ready();

      } catch (error) {
        // If an error occurs during login, show an error message
        toast.error(error.message);
      }
    }
  };

  return (
    // main outer div
    <div className=" h-[100vh] w-[100vw] flex dark:bg-white items-center justify-center ">
      {/* // container div containing all the fields, buttons, texts */}
      <div className="h-fit sm:h-[80vh] bg-white dark:bg-white border-2 border-slate-200 text-opacity-90 shadow-2xl w-[90vw] md:w-[80vw] lg:w-[70vw] rounded-3xl p-2 grid xl:grid-cols-2">
        {/* Upper texts and icon div */}
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center justify-center">
            <h1 className=" text-4xl font-bold md:text-6xl dark:text-black ">Welcome</h1>
            <img src={ChatIcon} alt="Chat icon " className="w-16  " />
          </div>
          <p className="text-xl dark:text-black ">Fill in the details to start a Chat!</p>
        </div>

        {/* main fields and buttons div  */}
        <div className=" flex items-center justify-center w-full ">
          {/* login and signup tabs div */}
          <Tabs className="w-full  sm:w-3/4" defaultValue="login" onValueChange={Ready} >
            <TabsList className={`bg-transparent rounded-none w-full`}>
              {/* login tab */}
              <TabsTrigger
                value="login"
                className={` data-[state=active]:bg-transparent text-black dark:text-black text-opacity-90 border-b-2 rounded-none data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500  w-full p-3 transition-all duration-300 `}

              >
                Login
              </TabsTrigger>

              {/* Signup tab */}
              <TabsTrigger
                value="signup"
                className={` data-[state=active]:bg-transparent text-black dark:text-black text-opacity-90 border-b-2 rounded-none data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500  w-full p-3 transition-all duration-300 `}

              >
                Signup
              </TabsTrigger>
            </TabsList>

            {/* Login tab fields and button */}
            <TabsContent className="flex flex-col gap-5 m-10" value="login">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 dark:bg-white dark:text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full p-6 dark:bg-white dark:text-black "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button className="rounded-full p-6 dark:bg-black text-white" onClick={handleLogin}>
                Login
              </Button>
            </TabsContent>

            {/* Signup tab fields and button */}
            <TabsContent className="flex flex-col gap-5 m-10" value="signup">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-6 dark:bg-white text-black "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="text"
                className="rounded-full p-6  dark:bg-white text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="rounded-full p-6 dark:bg-white text-black"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button className="rounded-full p-6 dark:bg-black text-white" onClick={handleSignup}>
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