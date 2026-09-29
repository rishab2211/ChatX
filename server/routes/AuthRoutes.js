// express router allows to create modular route handlers
import { Router } from "express";
// containing signup and login logic
import { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage, logOut } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";



const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed."), false);
  }
};

// instance of Express router
const authRoutes = Router();
const upload = multer({
  dest: "uploads/profiles/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});
// on /signup endpoint the signup logic will be used
authRoutes.post("/signup", signup);
// on /login endpoint the signup login will be used
authRoutes.post("/login", login);

authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile)
authRoutes.post("/add-profile-image", verifyToken, upload.single("profile-image"), addProfileImage)
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage)
authRoutes.post("/logout",logOut);


export default authRoutes;