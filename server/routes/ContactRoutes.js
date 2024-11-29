import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { searchContacts } from "../controllers/ContactsController.js";

export const contactsRoutes = Router();

contactsRoutes.post("/search",verifyToken, searchContacts );
