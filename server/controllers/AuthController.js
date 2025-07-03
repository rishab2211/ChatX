import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";

// Creating JWT token with expiration of 3 days
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  // sign user jwt with max-age
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

// signup controller
export const signup = async (req, res) => {
  try {
    // destructuring email, password from request body
    const { email, password } = req.body;

    // if email or password not available
    if (!email || !password) {
      // client error or invalid info provided
      return res.status(400).send("Email and Password is required");
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // conflic with resource (Which means it already exist)
      return res.status(409).send("Email already exists");
    }

    // Creating user in the DB
    const user = await User.create({ email, password });

    // setting JWT token as cookie
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
    // Server is unable to fulfill a request due to an unexpected condition.
    return res.status(500).send("Internal server error", err.message);
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    // destructuring fields
    const { email, password } = req.body;

    // check if fields exist
    if (!email || !password) {
      // client error
      return res.status(400).send("Email and Password are required");
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // send 404 code with message
      return res.status(404).send("User with the given email not found.");
    }

    // if found,
    // check if password is correct
    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(400).send("Password is not correct");
    }

    // setting JWT token as cookie
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
    // If something goes wrong
    return res.status(500).send("Internal server error", err.message);
  }
};

export const getUserInfo = async (req, res) => {
  try {
    // find user in DB
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with the given ID not found.");
    }

    // if found return details
    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileSetup: userData.profileSetup,
      image: userData.image,
    });
  } catch (err) {
    // If something goes wrong
    return res.status(500).send("Internal server error", err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    // destruct info from request
    const { userId, firstName, lastName, color } = req.body;

    // validation - exist
    if (!firstName || !lastName) {
      return res.status(400).send("Firstname, lastname is required.");
    }

    // find the user by id and update
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, reValidators: true }
    );

    // if successfull send the information
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

    // validate file - exist
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    // give name to file with current time
    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);

    // update user field in the db
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ image: updatedUser.image });
  } catch (err) {
    return res.status(422).send("Failed to upload profile image");
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return res.status(200).send("Profile image removed succesfully");
  } catch (err) {
    console.log(err.message);
  }
};

export const logOut = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });

    return res.status(200).send("Logout successful");
  } catch (err) {
    console.log(err.message);
  }
};
