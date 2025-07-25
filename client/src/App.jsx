import { useEffect, useState } from "react";
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

// Default options for the loading animation
export const animationDefaultOptionsChatLoading = {
  loop: true,
  autoplay: true,
  animationData
}

// PrivateRoute and AuthRoute components are used to protect routes based on authentication status
// PrivateRoute allows access to authenticated users, while AuthRoute redirects authenticated users away from auth pages.
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

  // Using useAppStore to manage global state for user information
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true); // State to manage loading status

  // Fetch user data when the component mounts or when userInfo changes
  useEffect(() => {
    // Function to fetch user data from the API
    const getUserData = async () => {
      try {
        const response = await apiCLient.get(GET_USER_INFO, {
          withCredentials: true, // Include credentials for cross-origin requests
        });

        // Check if the response is successful and contains user data
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

    // If userInfo is not available, fetch user data
    // If userInfo is available, set loading to false
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  // If loading is true, show a loading animation
  if (loading) {
    return <div className=" w-[100vw] h-[100vh] flex flex-col justify-center items-center pb-20" >
      <Lottie
        isClickToPauseDisabled={true}
        height={400}
        width={400}
        options={animationDefaultOptionsChatLoading}
      />
      <span className="text-xl font-semibold">Hang tight! We're waking up the server for you...</span>
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
