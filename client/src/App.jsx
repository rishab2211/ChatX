import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthIndex from "./pages/auth";
import ChatIndex from "./pages/chat";
import ProfileIndex from "./pages/profile";
import { useAppStore } from "./store";
import apiCLient from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";
import { ThemeProvider } from "./components/ui/theme-provider"
import Lottie from 'react-lottie';
import animationData from "../src/assets/customer-service-chat.json";

export const animationDefaultOptionsChatLoading = {
  loop:true,
  autoplay:true,
  animationData
}



const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to={"/auth"} />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to={"/chat"} /> : children;
};

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiCLient.get(GET_USER_INFO, {
          withCredentials: true,
        });


        if (response.status == 200 && response.data.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(undefined);
        }
      } catch (err) {
        setUserInfo(undefined);
        // console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);      
    }
  }, [userInfo]);

  if (loading) {
    return <div className=" w-[100vw] h-[100vh] flex justify-between items-center pb-20" >
      
      <Lottie
            isClickToPauseDisabled={true}
            height={400}
            width={400}
            options={animationDefaultOptionsChatLoading}
            />
    </div>;
  }

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Auth page comprising of signup and login */}
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthIndex />
              </AuthRoute>
            }
          />
          {/* Chat route */}
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatIndex />
              </PrivateRoute>
            }
          />
          {/* Profile setup and update page */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileIndex />
              </PrivateRoute>
            }
          />

          {/* Wildcard route, if user types anything other than auth, chat, route then it'll be directed to auth page */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider >
    </>
  );
};

export default App;
