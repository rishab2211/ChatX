// express router allows to create modular route handlers
import { Router } from "express";
// containing signup and login logic
import { signup, login, getUserInfo, updateProfile } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

// instance of Express router
const authRoutes = Router();

// on /signup endpoint the signup logic will be used
authRoutes.post("/signup", signup);
// on /login endpoint the signup login will be used
authRoutes.post("/login", login);

authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile",verifyToken,updateProfile)
export default authRoutes;
