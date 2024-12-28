import mongoose, { model, mongo } from "mongoose";

const messageSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true,
    },
    recipient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
    },
    messageTypes : {
        type : String,
        enum : ["text","file"],
        required : true,
    },
    content : {
        type:String,
        required :function(){
            return this.messageTypes==="text";
        }
    },
    fileUrl :{
        type:String,
        required :function(){
            return this.messageTypes==="file";
        }
    },
    timestamp:{
        type:Date,
        default:Date.now,
    },
});

const Messages = mongoose.model("Messages",messageSchema);

export default Messages;
