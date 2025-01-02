import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Messages from "../models/MessagesModel.js";
import Channel from "../models/ChannelModel.js";

export const searchContacts = async (req, res, next) => {

    try {
  
      const {searchTerm} = req.body;

      if(!searchTerm){
        return res.status(400).send("searchTerm is required")
      }

      const sanitizedSearchTerm = searchTerm.replace(/[.*+?^{}()|[|]\\]/g, "\\$&");

      const regex = new RegExp(sanitizedSearchTerm, "i");

      const contacts = await User.find({
        $and: [{ _id: { $ne: req.userId } }],
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      });
  
      return res.status(200).json({
        contacts
      })
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Internal Server Error");
    }
  
  }

  
  export const getContactsForDMList = async (req, res, next) => {
    try {
      let { userId } = req;
      
      userId = new mongoose.Types.ObjectId(userId);
  
      const contacts = await Messages.aggregate([
        {
          $match: {
            $or: [
              { sender: userId },
              { recipient: userId }
            ]
          },
        },
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$sender", userId] }, 
                then: "$recipient",
                else: "$sender",
              }
            },
            lastMessageTime: { $first: "$timestamp" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "contactInfo"
          }
        },
        {
          $unwind: "$contactInfo"
        },
        {
          $project: {
            _id: 1,
            lastMessageTime: 1,
            email: "$contactInfo.email",
            firstName: "$contactInfo.firstName",
            lastName: "$contactInfo.lastName",
            image: "$contactInfo.image",
            color: "$contactInfo.color",
          }
        },
        {
          $sort: { lastMessageTime: -1 }
        }
      ]);
  
      return res.status(200).json({
        contacts
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({
        error: "Internal Server Error"
      });
    }
  };



  export const getAllContacts = async (req, res, next) => {

    try {
  
      const users = await User.find(
        {_id :{ $ne: req.userId}},
        "firstName lastName _id email"
      ); 

      const contacts = users.map((user)=>({
        label: user.firstName?
        `${user.firstName} ${user.lastName}`: user.email,
        value: user._id
      }));

      return res.status(200).json({contacts});

    } catch (err) {
      console.log(err.message);
      res.status(500).send("Internal Server Error");
    }
  
  }



export const createChannel = async(req, res, next) => {
    try {
        const { nameOfChannel, members } = req.body;

        const userId = req.userId;

        const admin = await User.findById(userId);
        if(!admin) {
            return res.status(400).send("admin user not found");
        }

        const validMembers = await User.find({ _id: { $in: members }});

        if(validMembers.length !== members.length) {
            return res.status(400).send("Some users are not valid users");
        }

        const newChannel = new Channel({
            nameOfChannel,
            members,
            admin: userId
        });

        await newChannel.save();
        return res.status(201).json({
            channel: newChannel
        });

    } catch(err) {
        console.log(err);
        next(err); 
    }
}