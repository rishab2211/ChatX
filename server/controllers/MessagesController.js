import Messages from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";
export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    // console.log("this is user1 id :"+user1);

    const user2 = req.body.id;
    // console.log("this is user2 id :"+user2);

    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required");
    }

    const storedMessages = await Messages.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({
      storedMessages,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    console.log("inside upload file");

    if (!req.file) {
      res.status(400).send("file is required");
    }
    console.log("file :", req.file);

    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    console.log("file directory :" + fileDir);
    let fileName = `${fileDir}/${req.file.originalname}`;
    console.log("file name : " + fileName);

    mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    return res.status(200).json({
      filePath: fileName,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};
