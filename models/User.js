const mongoose = require("mongoose");
const {Schema} = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: null,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }

},{ timestamps: true,});

// Hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    }
  
    try {
      if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
  
      next();
    } catch (error) {
      return next(error);
    }
  });


const User = mongoose.model("User", userSchema);
module.exports = User;