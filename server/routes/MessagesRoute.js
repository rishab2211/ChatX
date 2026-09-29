import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import multer from "multer";

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/zip', 'application/x-rar-compressed'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};

const messagesRoutes = Router();
const upload = multer({
  dest: "uploads/files",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
messagesRoutes.post("/get-messages",verifyToken,getMessages);
messagesRoutes.post("/upload-file",verifyToken,upload.single("file"),uploadFile);
export default messagesRoutes;