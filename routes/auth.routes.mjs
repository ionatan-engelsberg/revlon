import express from "express";
import { hashSync, genSaltSync, compareSync } from 'bcrypt';

import { USER_VIA } from "../constants.mjs";

import {
  createUser,
  findUser
} from "../db/repository.mjs";

const PASSOWRD_MIN_LENGTH = 8;

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

export { router };