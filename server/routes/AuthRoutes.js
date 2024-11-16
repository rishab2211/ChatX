// express router allows to create modular route handlers
import { Router } from "express";
// containing signup and login logic
import { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";



// instance of Express router
const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles" })
// on /signup endpoint the signup logic will be used
authRoutes.post("/signup", signup);
// on /login endpoint the signup login will be used
authRoutes.post("/login", login);

authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile)
authRoutes.post("/add-profile-image", verifyToken, upload.single("profile-image"), addProfileImage)
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage)



export default authRoutes;
