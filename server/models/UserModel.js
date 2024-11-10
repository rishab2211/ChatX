import { genSalt, hash } from "bcrypt";
import mongoose, { mongo } from "mongoose";

// User schema definition and initialization with all the necesarry attributes
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  color: {
    type: Number,
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
});

// Pre-save middleware for mongoose schema
// Hashes password before saving it
userSchema.pre("save", async function (next) {
  // salt is random string added before hashing, adds extra layer security
  const salt = await genSalt();
  this.password = await hash(this.password, salt);
  next();
});

// Model creation
const User = mongoose.model("Users", userSchema);

export default User;
