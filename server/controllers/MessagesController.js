import Messages from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";


export const getMessages = async (req, res, next) => {
  try {
    // Check if userId and recipientId are provided
    const user1 = req.userId;
    const user2 = req.body.id;
    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required");
    }


    // get the messages between the two users
    const storedMessages = await Messages.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    // If no messages found, return an empty array
    if (!storedMessages || storedMessages.length === 0) {
      return res.status(200).json({
        messages: []
      });
    }

    // Return the messages in the response
    return res.status(200).json({
      storedMessages
    });
  } catch (err) {
    res.status(500).send("Could not fetch messages");
  }
};


// Function to upload a file
export const uploadFile = async (req, res) => {
  try {

    // Check if the file is provided
    if (!req.file) {
      return res.status(400).send("file is required");
    }

    // Create a directory for the file if it doesn't exist
    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${req.file.originalname}`;

    // Ensure the directory exists
    mkdirSync(fileDir, { recursive: true });
    // Rename the file to its new location
    // This will move the file from the temporary location to the new directory
    renameSync(req.file.path, fileName);

    // Return the file path in the response
    return res.status(200).json({
      filePath: fileName,
    });
  } catch (err) {
    res.status(500).send("Could not upload file");
  }
};