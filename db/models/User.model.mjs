import { Schema, model } from "mongoose";

import { USER_VIA } from "../../constants.mjs";

export const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'User first name is required'],
    minlength: 3,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'User first name is required'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'User password is required'],
    minlength: 8
  },
  birthdate: {
    type: Date,
    required: [true, 'User birthdate is required']
  },
  zipCode: {
    type: String,
    required: [true, 'User zip code is required']
  },
  via: {
    type: String,
    required: [true, 'User via is require'],
    enum: {
      values: Object.values(USER_VIA),
      message: `User via must be noe of the following: ${Object.values(USER_VIA)}`
    }
  },
  isVerified: {
    type: Boolean
  },
  verificationToken: {
    type: String
  },
  state: {
    type: String,
    required: [true, "User state is required"]
  },
  // locality: {
  //   type: String,
  //   required: [true, "User locality is required"]
  // }
},
  { timestamps: true, versionKey: false });

export const UserModel = model('User', UserSchema);