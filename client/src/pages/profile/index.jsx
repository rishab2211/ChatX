import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Trash2, Save, User, Mail, Palette, Loader2 } from 'lucide-react';
import { ADD_PROFILE_IMAGE_ROUTE, HOST, REMOVE_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE } from "../../utils/constants";
import { ModeToggle } from "../../components/ui/mode-toggle";
import apiCLient from "../../lib/api-client";
import { colors, getColor } from "../../lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";

const ProfileIndex = () => {
  // Using useAppStore to manage global state for user information
  const { userInfo, setUserInfo } = useAppStore();

  // Using useNavigate hook from react-router-dom to navigate between routes
  const navigate = useNavigate();

  // State variables for profile information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Using useRef to reference the file input element
  const fileInputRef = useRef(null);

  // Function to validate profile information
  const validateProfile = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First & last name are required");
      return false;
    }
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      toast.error("Names must be at least 2 characters long");
      return false;
    }
    return true;
  };

  // Function to save profile changes
  const saveChanges = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);

    try {

      const response = await apiCLient.post(
        UPDATE_PROFILE_ROUTE,
        {
          userId: userInfo.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          color: selectedColor,
        },
        { withCredentials: true }
      );

      if (response.status == 200 && response.data) {
        setUserInfo(response.data);
        toast.success("Profile updated successfully");
        navigate("/chat");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to set initial values for profile fields when userInfo changes
  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setSelectedColor(userInfo.color || 0);
      if (userInfo.image) {
        setImage(`${HOST}/${userInfo.image}`);
      }
    }
  }, [userInfo]);

  // Function to handle navigation back to chat or profile page
  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please setup profile");
    }
  };

  // Function to handle image change when a new profile image is selected
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, SVG, WebP)");
      return;
    }

    setIsImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("profile-image", file);

      const response = await apiCLient.post(
        ADD_PROFILE_IMAGE_ROUTE,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        setImage(`${HOST}/${response.data.image}`);
        toast.success("Image updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update image");
    } finally {
      setIsImageUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Function to handle deletion of the profile image
  const handleDeleteImage = async () => {
    setIsImageUploading(true);

    try {
      const response = await apiCLient.delete(
        REMOVE_PROFILE_IMAGE_ROUTE,
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        toast.success("Profile image removed successfully");
        setImage(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove image");
    } finally {
      setIsImageUploading(false);
    }
  };

  // Function to handle file input click event
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Get user's display initial
  const getUserInitial = () => {
    if (firstName?.trim()) {
      return firstName.trim().charAt(0).toUpperCase();
    }
    if (userInfo?.email) {
      return userInfo.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get user's display name
  const getUserDisplayName = () => {
    const fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
    return fullName || 'User';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-8 transition-all duration-300 hover:shadow-3xl">

          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-4">
              <button
                onClick={handleNavigate}
                disabled={isLoading || isImageUploading}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage your account preferences
                </p>
              </div>
            </div>

            <ModeToggle />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Avatar Section */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative group">
                <div
                  className="relative w-48 h-48 cursor-pointer transition-all duration-300 group-hover:scale-105"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-700 shadow-xl">
                    {image ? (
                      <img
                        src={image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImage(null);
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-6xl font-bold text-white ${getColor(selectedColor)}`}>
                        {getUserInitial()}
                      </div>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-all duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                      onClick={image ? handleDeleteImage : handleFileInputClick}
                      disabled={isImageUploading}
                      className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isImageUploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : image ? (
                        <Trash2 className="w-6 h-6 text-white" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  disabled={isImageUploading}
                />
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {getUserDisplayName()}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{userInfo?.email}</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Personal Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userInfo?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed</p>
                </div>
              </div>

              {/* Avatar Color Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Avatar Color</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      disabled={isLoading}
                      className={`w-12 h-12 rounded-xl ${color} transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${selectedColor === index
                        ? 'ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-slate-800'
                        : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveChanges}
                disabled={isLoading || isImageUploading || !firstName.trim() || !lastName.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileIndex;