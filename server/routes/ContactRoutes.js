import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getContactsForDMList, searchContacts } from "../controllers/ContactsController.js";

export const contactsRoutes = Router();

contactsRoutes.post("/search",verifyToken, searchContacts );
contactsRoutes.get("/get-contacts-for-dm",verifyToken,getContactsForDMList);