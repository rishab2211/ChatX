import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../../../../store';
import apiClient from '../../../../../../lib/api-client';
import { getColor } from '../../../../../../lib/utils';
import { HOST, LOGOUT_ROUTE } from '../../../../../../utils/constants';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from 'react-icons/fi';
import { IoPowerSharp } from "react-icons/io5";
import { FaSpinner } from 'react-icons/fa'; // Added for loading state

export const ProfileInfo = () => {

    // Get userInfo from the store
    const { userInfo, setUserInfo } = useAppStore();
    const navigate = useNavigate();

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Memoize user details to avoid re-calculating on every render
    const displayName = useMemo(() => {
        if (!userInfo) return "";
        return [userInfo.firstName, userInfo.lastName].filter(Boolean).join(' ');
    }, [userInfo]);

    // Memoize initials for the avatar
    const initials = useMemo(() => {
        if (!userInfo) return "?";
        const first = userInfo.firstName?.charAt(0) || '';
        const last = userInfo.lastName?.charAt(0) || '';
        return first + last || (userInfo.email?.charAt(0) ?? '?');
    }, [userInfo]);

    // Handle user logout with loading and error states
    const handleLogout = useCallback(async () => {

        // Set loading state
        if (isLoading) return; // Prevent multiple clicks
        setIsLoading(true);
        setError(null);
        try {

            // Send logout request to the server
            await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });

            // If logout is successful, navigate to auth page and clear user info
            localStorage.removeItem("vite-ui-theme");
            setUserInfo(null);
            navigate("/auth");
        } catch (err) {
            console.error("Logout failed:", err);
            setError("Logout failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [navigate, setUserInfo]);

    if (!userInfo) return null; // Don't render if there's no user

    return (
        <TooltipProvider delayDuration={0}>
            <div className='absolute bottom-0 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-5 py-5 w-full bg-gray-50 dark:bg-gray-900'>
                {/* User Info Section */}
                <div className='flex items-center gap-3' role="button" tabIndex={0} onClick={() => navigate("/profile")} onKeyDown={(e) => e.key === 'Enter' && navigate("/profile")}>
                    <Avatar className="h-11 w-11">
                        <AvatarImage
                            src={`${HOST}/${userInfo.image}`}
                            alt={displayName}
                            className="object-cover"
                        />
                        <AvatarFallback className={`uppercase text-lg font-bold ${getColor(userInfo.color)}`}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className='text-md font-semibold text-gray-800 dark:text-gray-200 truncate'>
                        {displayName}
                    </span>
                </div>

                {/* Action Buttons Section */}
                <div className='flex items-center gap-2'>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => navigate("/profile")}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Edit Profile"
                            >
                                <FiEdit2 className="text-gray-600 dark:text-gray-400 text-lg" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Profile</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Logout"
                            >
                                {isLoading ? (
                                    <FaSpinner className="animate-spin text-red-500 text-lg" />
                                ) : (
                                    <IoPowerSharp className="text-red-500 text-lg" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Logout</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            {error && <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md text-sm">{error}</div>}
        </TooltipProvider>
    );
};

export default ProfileInfo;