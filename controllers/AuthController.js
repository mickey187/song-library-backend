require('dotenv').config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;
const bcrypt = require('bcrypt');


const generateToken = (user) => {
    try {
      console.log("Secret Key: ", secretKey);
      const token = jwt.sign(
        { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName,  },
        secretKey
      );
      return token;
    } catch (error) {
      throw new Error(`Error generating token ${error.message}`);
    }
  };


const register = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await User.create(userData);

    if (newUser) {
      console.log("user created successfully");

      // Generate a JWT token for the user
      const token = generateToken(newUser);
      return res.status(201).json({
        status: "success",
        statusCode: 201,
        message: "user created successfully",
        token: token,
      });
    }else{
        throw new Error( `error creating new user`)
    }
  } catch (error) {
    console.error("error registering user: ", error);
    return res.status(500).json({
        status: 500,
        success: false,
        message: `User registration failed${error.message}`,
      });
    
  }
};

const login =  async(req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      // Check if the user exists and the password is correct
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return false;
      }
  
      // Create a JWT token
      const token = generateToken(user);
      user.token = token
      const userData = user.toJSON();
      userData.token = token
      console.log("userData", userData);
     
      if (!token) {
        return res.status(401).json({
          statusCode: 401,
          status: "error",
          message: "Invalid credentials",
        });
      } else {
        return res.status(200).json({
          statusCode: 200,
          status: "success",
          message: "Login Successful",
          data: {
            
            user: userData,
          },
        });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        status: "error",
        message: `Error logging in: ${error.message}`,
      });
    }
  };

module.exports = {register, login};
