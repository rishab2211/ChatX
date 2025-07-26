import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async (req, res) => {
    try {
        // destructuring the request body
        const { nameOfChannel, members } = req.body;

        // validation - exist
        const userId = req.userId;

        // check if the user exists
        const admin = await User.findById(userId);
        if (!admin) {
            res.status(400).send("admin user not found");
        }

        // validation - members
        const validMembers = await User.find({ _id: { $in: members } });
        if (validMembers.length !== members.length) {
            return res.status(400).send("Some users are not valid users");
        }

        // create a new channel
        const newChannel = new Channel({
            nameOfChannel,
            members,
            admin: userId
        });
        await newChannel.save();

        // Return the newly created channel
        return res.status(201).json({
            channel: newChannel
        })

    } catch (err) {
        return res.status(500).send("Could not create channel");

    }
}


export const getUserChannels = async (req, res) => {
    try {

        // Get the user ID from the request
        if (!req.userId) {
            return res.status(400).send("User ID is required");
        }
        // Convert userId to ObjectId
        const userId = new mongoose.Types.ObjectId(req.userId);

        // Find channels where the user is either an admin or a member
        // Use $or to find channels where the user is either an admin or a member
        // Sort channels by updatedAt in descending order
        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }]
        }).sort({ updatedAt: -1 });

        // If no channels found, return an empty array
        if (channels.length === 0) {
            return res.status(200).json({
                channels: []
            });
        }
        // Return the channels
        return res.status(200).json({
            channels: channels
        })

    } catch (err) {
        // If something goes wrong
        return res.status(500).send("Could not fetch channels");
    }
}

export const getChannelMessages = async (req, res, next) => {
    try {

        // Get the channel ID from the request parameters
        if (!req.params.channelId) {
            return res.status(400).send("Channel ID is required");
        }
        const { channelId } = req.params;

        
        /*
            1.  Find the channel by its ID using Mongoose's Channel model
                This fetches the channel document from the database
                Channel.findById(channelId)
        
            2.  .populate(): replaces message IDs in the channel with the full message documents
                Instead of just returning ObjectIds, it pulls in the full referenced documents
        
            3.  Nested population: for each message, also populate the sender field
                This fetches the full sender object for each message

            4.  .select(): limits the fields fetched from sender to avoid exposing sensitive data
                Only fetches safe fields like name, email, and image (not things like password)
        */

        const channel = await Channel.findById(channelId).populate({
            path: "messages",
            populate: {
                path: "sender",
                select: "firstName lastName email _id image color"
            },
        });

        // If channel not found, return 404
        if (!channel) {
            return res.status(404).send("Channel not found");
        }

        // Return the messages of the channel
        return res.status(200).json({
            messages: channel.messages
        })

    } catch (err) {
        // If something goes wrong
        return res.status(500).send("Could not fetch channel messages");
    }
}