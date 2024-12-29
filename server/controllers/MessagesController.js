import Messages from "../models/MessagesModel.js";

export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    console.log("this is user1 id :"+user1);
    
    const user2 = req.body.id;
    console.log("this is user2 id :"+user2);

    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required");
    }

    const storedMessages = await Messages.find({
      $or: [{ sender: user1, recipient: user2 },{sender: user2, recipient: user1}],
    }).sort({timestamp :1});

    return res.status(200).json({
      storedMessages,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};
