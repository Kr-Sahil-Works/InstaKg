import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async  (req,res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (password !== confirmPassword){
            
            return res.status(400).json({ error : "Password does not match "});
        }

        const user = await User.findOne({username});

        if(user) {
            return res.status(400).json({error : "Username already exists"})
        }

        //  Hash passwords here 
        const salt = await bcrypt.genSalt(14); 
        const hashedPassword = await bcrypt.hash(password, salt);

        // Profile Pic from API 
        const boyProfilePic =
  `https://api.dicebear.com/7.x/personas/svg?seed=${username}&gender=male`;

const girlProfilePic =
  `https://api.dicebear.com/7.x/personas/svg?seed=${username}&gender=female`;

        const newUser = new User ({
            fullName,
            username,
            password: hashedPassword,
            gender,
            profilePic : gender === "male" ? boyProfilePic : girlProfilePic
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            profilePic:newUser.profilePic
        })
        }else {
            res.status(400).json({error : "Invaild user data"});
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const login = async (req,res) => {
   try {
    const {username,password} = req.body;
    const user = await User.findOne ({username});
    const isPasswordCorrect = await bcrypt.compare(password,user?.password || "");

    if(!user || !isPasswordCorrect){
        return res.status(400).json({error : "Invaild username or password"});
    }

    generateTokenAndSetCookie(user._id,res);

    res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic:user.profilePic
        })

   } catch (error) {
     console.log("Error in Login controller", error.message);
        res.status(500).json({error:"Internal Server Error"})
   }
}

export const logout = async (req,res) => {
   try {
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message: "Logged out successfully"}); 
   } catch (error) {
    console.log("Error in Logout controller", error.message);
        res.status(500).json({error:"Internal Server Error"})
   }
}