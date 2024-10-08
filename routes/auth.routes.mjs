import express from "express";
import jwt from 'jsonwebtoken';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { config } from 'dotenv';

import { USER_VIA } from "../constants.mjs";

import {
  createUser,
  findUser,
  updateUser
} from "../db/repository.mjs";

config();

const { JWT_SECRET } = process.env

const PASSOWRD_MIN_LENGTH = 8;

const MILISECONDS_IN_ONE_MINUTE = 1000 * 60;
const MILISECONDS_IN_ONE_HOUR = MILISECONDS_IN_ONE_MINUTE * 60;
const JWT_VALIDATION_TIME = 6 * MILISECONDS_IN_ONE_HOUR;

const router = express.Router();

const validateBirthdate = (birthdateString) => {
  const CURRENT_TIME = new Date();
  const birthdate = new Date(birthdateString);

  let age = CURRENT_TIME.getFullYear() - birthdate.getFullYear();

  if (
    (CURRENT_TIME.getMonth() - birthdate.getMonth() < 0) ||
    ((CURRENT_TIME.getMonth() == birthdate.getMonth()) && (CURRENT_TIME.getDate() < birthdate.getDate()))
  ) {
    age--;
  }

  if (age < 18) {
    throw new Error("User must be 18 or older");
  }
};

const validateSignUpBody = (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    birthdate,
    zipCode,
    via
  } = body

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !birthdate ||
    !zipCode ||
    !via
  ) {
    throw new Error("Some attribute is missing");
  }

  if (!Object.values(USER_VIA).includes(via)) {
    throw new Error(`Via must be one of the following: ${Object.values(USER_VIA)}`);
  }

  validateBirthdate(birthdate);

  if (password.length < PASSOWRD_MIN_LENGTH) {
    throw new Error("Password must be at least 8 chars");
  }

  if (firstName.length < 3 || firstName.length > 50) {
    throw new Error("First name must be between 3 and 50 chars");
  }

  if (lastName.length < 3 || lastName.length > 50) {
    throw new Error("Last name must be between 3 and 50 chars");
  }
};

const signup = async (req, res) => {
  const { body } = req;

  try {
    validateSignUpBody(body);
  } catch (error) {
    return res.status(400).json({ message: error.message ?? "Incorrect body" })
  }

  let existingUser;
  try {
    existingUser = await findUser({ email: body.email });
    return res.status(409).json({ message: "User with provided email already exists" });
  } catch (error) { }

  let createdUser;
  try {
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    body.isVerified = false;
    body.verificationToken = hashSync(JSON.stringify({ email: body.email, firstName: body.firstName, lastName: body.lastName }), salt);

    createdUser = await createUser(body);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  // TODO: send verifyAccount email

  const { _id, firstName, lastName, email, birthdate } = createdUser;
  const returnedUser = { _id, firstName, lastName, email, birthdate };
  return res.status(201).json(returnedUser)
};

router.post('/signup', signup);

const validateQueryParams = (query) => {
  if (Object.keys(query).length != 2) {
    throw new Error("Invalid link");
  }

  const { email, t: token } = query;
  if (!email || !token) {
    throw new Error("Invalid link");
  }
};

const verifyAccount = async (req, res) => {
  const { query } = req;

  try {
    validateQueryParams(query);
  } catch (error) {
    return res.status(400).json({ message: "Invalid link" })
  }

  try {
    const { email, t: token } = query;
    await findUser({ email, isVerified: false, verificationToken: token });
    await updateUser({ email }, { isVerified: true, verificationToken: "" });


  } catch (error) {
    return res.status(400).json({ message: "Invalid link" })
  }

  return res.status(200).json({ msg: "User verified successfully" });
};

router.post('/verify-account', verifyAccount);

const validateLoginBody = (body) => {
  if (Object.keys(body).length != 2) {
    throw new Error("Incorrect body");
  }

  const { email, password } = body
  if (!email || !password) {
    throw new Error("Incorrect body");
  }
};

const createJWT = async (data) => {
  return jwt.sign({ data }, JWT_SECRET, { expiresIn: JWT_VALIDATION_TIME });
};

const login = async (req, res) => {
  const { body } = req

  try {
    validateLoginBody(body);
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }

  let user;
  try {
    const { email, password } = body;
    user = await findUser({ email }, "_id password");

    const isPasswordCorrect = compareSync(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error("Incorrect credentials");
    }

  } catch (error) {
    return res.status(400).json({ message: error.message ?? "Incorrect credentials" });
  }

  const jwt = await createJWT({ id: user._id });
  return res.status(200).json({ token: jwt });
};

router.post('/login', login);

export { router };