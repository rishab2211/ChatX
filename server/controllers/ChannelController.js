import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async(req,res,next)=>{
    try{
        const {nameOfChannel, members}=req.body;
        console.log("channel name :"+nameOfChannel);
        console.log("members : "+members);
        
        

        const userId = req.userId;

        const admin = await User.findById(userId);

        if(!admin){
            res.status(400).send("admin user not found");
        }

        const validMembers = await User.find({_id:{$in:members}});

        if(validMembers.length!==members.length){
            return res.status(400).send("Some users are not valid users");
        }

        const newChannel = new Channel({
            nameOfChannel,
            members,
            admin:userId
        });

        await newChannel.save();
        return res.status(201).json({
            channel : newChannel
        })

    }catch(err){
        console.log(err);
        
    }
}


export const getUserChannels = async(req,res,next)=>{
    try{
        
        const userId = new mongoose.Types.ObjectId(req.userId);

        const channels = await Channel.find({
            $or:[{admin:userId},{members:userId}]
        }).sort({updatedAt : -1});

        return res.status(200).json({
            channels : channels
        })

    }catch(err){
        console.log(err);
        
    }
}

export const getChannelMessages = async(req,res,next)=>{
    try{
        
        const {channelId} = req.params;

        const channel = await Channel.findById(channelId).populate({path:"messages",
            populate:{
                path:"sender",
                select:"firstName lastName email _id image color"
            },
        });

        if(!channel){
            return res.status(404).send("Channel not found");
        }

       
        return res.status(200).json({
            messages : channel.messages
        })

    }catch(err){
        console.log(err);
        
    }
}