import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs"


// Maximum age of any session token created (3 days)
const maxAge = 3 * 24 * 60 * 60 * 1000;

// Creating JWT token with expiration of 3 days
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

// signup logic
export const signup = async (req, res, next) => {
  try {
    // destructuring the email and password object from request's body
    const { email, password } = req.body;

    // if email or password not available
    if (!email || !password) {
      // sending status code 400(server is unable to process a request due to a client error)

      return res.status(400).send("Email and Password is required");
    }

    // Checking if the user already exist
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // sending status code 409(indicates conflict between user's request and current web server state)
      // here, it indicates the user already exists
      return res.status(409).send("Email already exists");
    }

    // Creating user in the DB with the entered email and password
    const user = await User.create({ email, password });

    // setting cookie in the response with the "jwt" argument as the cookie’s name.
    // and creating token immedaitely with 3 days expiration
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    // status code 201(new resource created successfully)
    return res.status(201).json({
      // user's data
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileSetup: user.profileSetup,
      },
    });
  } catch (err) {
    console.log(err.message);
    // Server is unable to fulfill a request due to an unexpected condition.
    return res.status(500).send("Internal server error rishabraj");
  }
};

// Login logic
export const login = async (req, res, next) => {
  try {
    // destructuring the email and password object from request's body
    const { email, password } = req.body;

    // if email or password not available
    if (!email || !password) {
      // sending status code 400(server is unable to process a request due to a client error)
      return res.status(400).send("Email and Password are required");
    }

    // Finding user with the entered email
    const user = await User.findOne({ email });

    // If user does not exist in the DB
    if (!user) {
      // send 404 code with message
      return res.status(404).send("User with the given email not found.");
    }

    // if found then proceed,

    // Compare entered password with the actual password stored in DB
    const auth = await compare(password, user.password);

    // if Auth fails sends unable to process request due to client error
    if (!auth) {
      return res.status(400).send("Password is not correct");
    }

    // setting cookie in the response with the "jwt" argument as the cookie’s name.
    // and creating token immedaitely with 3 days expiration
    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    // Login successful
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileSetup: user.profileSetup,
      },
    });
  } catch (err) {
    console.log(err.message);
    // If something goes wrong
    return res.status(500).send("Internal server error");
  }
};



export const getUserInfo = async (req, res, next) => {
  try {

    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with the given ID not found.");
    }

    return res.status(200).json({

      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSetup: userData.profileSetup,
      image:userData.image
    });
  } catch (err) {
    console.log(err.message);
    // If something goes wrong
    return res.status(500).send("Internal server error");
  }
};


export const updateProfile = async (req, res, next) => {
  try {

    const { userId } = req;
    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).send("Firstname, lastname is required.");
    }

    const userData = await User.findByIdAndUpdate(userId, {
      firstName, lastName, color, profileSetup: true
    }, { new: true, reValidators: true })

    return res.status(200).json({

      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSetup: userData.profileSetup,
    });
  } catch (err) {
    // If something goes wrong
    return res.status(500).send("Internal server error");
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    console.log("File uploaded:", req.file.path);


    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(req.userId, { image: fileName }, { new: true, runValidators: true });

    return (res.status(200).json(
      { image: updatedUser.image })
    )
  } catch (err) {
    console.log(err.message);
    
  }
};


export const removeProfileImage = async (req,res,next) => {

  try{
    const {userId} = req;
    const  user =await User.findById(userId);

    if(!user){
      return res.status(404).send("User not found");
    }

    if(user.image){
      unlinkSync(user.image);
    }

    user.image=null;
    await user.save();

    return res.status(200).send("Profile image removed succesfully")
  }catch(err){
    console.log(err.message);
    
  }

}