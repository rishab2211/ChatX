import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Messages from "../models/MessagesModel.js";
import Channel from "../models/ChannelModel.js";


// Function to search contacts based on first name, last name, or email
// It uses a regular expression to perform a case-insensitive search
// It excludes the current user from the search results
export const searchContacts = async (req, res) => {

  try {

    // validate the search term from the request body
    const { searchTerm } = req.body;
    if (!searchTerm) {
      return res.status(400).send("searchTerm is required")
    }

    // Sanitize the search term to prevent regex injection
    // This replaces any special regex characters with their escaped versions
    const sanitizedSearchTerm = searchTerm.replace(/[.*+?^{}()|[|]\\]/g, "\\$&");

    // Create a case-insensitive regex from the sanitized search term
    // This allows for flexible searching without case sensitivity
    // The "i" flag makes the regex case-insensitive
    const regex = new RegExp(sanitizedSearchTerm, "i");


    // Find users in the database that match the regex
    const contacts = await User.find({
      $and: [{ _id: { $ne: req.userId } }],
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    });

    // return the found contacts in the response
    return res.status(200).json({
      contacts
    })
  } catch (err) {
    res.status(500).send("Failed to search contacts");
  }

}



// Function to get contacts for the Direct Message (DM) list
// It retrieves the last message time for each contact and their details
export const getContactsForDMList = async (req, res) => {


  try {
    // Extract userId from the request  
    if (!req.userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    // Convert userId to a mongoose ObjectId for querying
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);

    // Aggregate messages to find contacts based on the last message sent or received
    // The aggregation pipeline matches messages where the user is either the sender or recipient
    // It sorts messages by timestamp, groups them by the other party (sender or recipient),
    // and retrieves the last message time for each contact
    // Finally, it looks up the user details for each contact and formats the response
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


    // If no contacts are found, return an empty array  
    if (!contacts || contacts.length === 0) {
      return res.status(200).json({
        contacts: []
      });
    }
    // Return the contacts in the response
    return res.status(200).json({
      contacts
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to retrieve contacts for DM list"
    });
  }
};


// Function to get all contacts excluding the current user
export const getAllContacts = async (req, res, next) => {

  try {

    // find the users in the database excluding the current user
    const users = await User.find(
      { _id: { $ne: req.userId } },
      "firstName lastName _id email"
    );

    // If no users are found, return an empty array
    if (!users || users.length === 0) {
      return res.status(200).json({ contacts: [] });
    }

    // Map the users to a format suitable for the response
    const contacts = users.map((user) => ({
      label: user.firstName ?
        `${user.firstName} ${user.lastName}` : user.email,
      value: user._id
    }));

    // Return the contacts in the response
    return res.status(200).json({ contacts });

  } catch (err) {
    res.status(500).send("Failed to retrieve contacts");
  }

}