import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { hashSync, genSaltSync, compareSync } from "bcrypt";
import { config } from "dotenv";

import { USER_VIA, STATES, LOCALITIES } from "../constants.mjs";

import { createUser, findUser, updateUser } from "../db/repository.mjs";

config();

const { JWT_SECRET, ZOHO_EMAIL, ZOHO_PASSWORD } = process.env;

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
    CURRENT_TIME.getMonth() - birthdate.getMonth() < 0 ||
    (CURRENT_TIME.getMonth() == birthdate.getMonth() &&
      CURRENT_TIME.getDate() < birthdate.getDate())
  ) {
    age--;
  }

  if (age < 18) {
    throw new Error("Debes tener 18 años o más para registrarte");
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
    via,
    state,
    //locality
  } = body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !birthdate ||
    !zipCode ||
    !via ||
    !state
    //!locality
  ) {
    throw new Error("Debes completar todos los campos para avanzar");
  }

  if (!Object.values(USER_VIA).includes(via)) {
    throw new Error(
      `Via must be one of the following: ${Object.values(USER_VIA)}`
    );
  }

  validateBirthdate(birthdate);

  if (zipCode.length != 5) {
    throw new Error("El código postal ingresado es inválido");
  }

  if (!STATES.includes(state)) {
    throw new Error("El estado ingresado es inválido");
  }

  // if (!LOCALITIES[state].includes(locality)) {
  //   throw new Error(`El municipio ingresado es inválido. Los posibles municipios para el estado ${state} son ${LOCALITIES[state]}`);
  // }

  if (password.length < PASSOWRD_MIN_LENGTH) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  if (firstName.length < 3 || firstName.length > 50) {
    throw new Error("El nombre debe tener entre 3 y 50 caracteres");
  }

  if (lastName.length < 3 || lastName.length > 50) {
    throw new Error("El apellido debe tener entre 3 y 50 caracteres");
  }
};

const sendVerificationEmail = async (
  email,
  firstName,
  lastName,
  verificationToken
) => {
  const transport = nodemailer.createTransport({
    host: "smtp.zoho.com",
    auth: {
      user: ZOHO_EMAIL,
      pass: ZOHO_PASSWORD,
    },
    port: 465,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
    requireTLS: true,
  });

  const prodLink = `https://daleonatuestilo.com/verify-account?t=${verificationToken}&email=${email}`;
  const testLink = `http://localhost:5173/verify-account?t=${verificationToken}&email=${email}`;
  const accountVerificationLink = prodLink

  const message = {
    from: ZOHO_EMAIL,
    to: email,
    subject: "Verificación de Cuenta | Dale ON a tu estilo",
    html: `
    <h1>Hola, <b>${firstName} ${lastName}</b>!</h1>
    <h3>Haz click <a href="${accountVerificationLink}">aquí</a> verificar tu cuenta</h3>
    `,
  };

  try {
    await transport.sendMail(message);
    // TODO: Verification handling
  } catch (error) {
    console.log("ERROR: ", error);
    // TODO: Error handling
  }
};

const signup = async (req, res) => {
  const { body } = req;

  try {
    validateSignUpBody(body);
  } catch (error) {
    return res.status(400).json({ message: error.message ?? "Incorrect body" });
  }

  let existingUser;
  try {
    existingUser = await findUser({ email: body.email });
    return res
      .status(409)
      .json({ message: "El email ingresado ya está siendo utilizado" });
  } catch (error) {}

  let createdUser;
  try {
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    body.isVerified = false;
    body.verificationToken = hashSync(
      JSON.stringify({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      }),
      salt
    );
    body.participations = 0;

    createdUser = await createUser(body);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const { _id, firstName, lastName, email, birthdate, verificationToken } =
    createdUser;
  const returnedUser = { _id, firstName, lastName, email, birthdate };

  await sendVerificationEmail(email, firstName, lastName, verificationToken);
  return res.status(201).json(returnedUser);
};

router.post("/signup", signup);

const validateQueryParams = (query) => {
  if (Object.keys(query).length != 2) {
    throw new Error("El link es incorrecto o ya expiró");
  }

  const { email, t: token } = query;
  if (!email || !token) {
    throw new Error("El link es incorrecto o ya expiró");
  }
};

const verifyAccount = async (req, res) => {
  const { query } = req;

  try {
    validateQueryParams(query);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "El link es incorrecto o ya expiró" });
  }

  try {
    const { email, t: token } = query;
    await findUser({ email, isVerified: false, verificationToken: token });
    await updateUser({ email }, { isVerified: true, verificationToken: "" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "El link es incorrecto o ya expiró" });
  }

  return res.status(200).json({ msg: "User verified successfully" });
};

router.post("/verify-account", verifyAccount);

const validateLoginBody = (body) => {
  if (Object.keys(body).length != 2) {
    throw new Error("Debes enviar email y contraseña para iniciar sesión");
  }

  const { email, password } = body;
  if (!email || !password) {
    throw new Error("Debes enviar email y contraseña para iniciar sesión");
  }
};

const createJWT = async (data) => {
  return jwt.sign({ data }, JWT_SECRET, { expiresIn: JWT_VALIDATION_TIME });
};

const login = async (req, res) => {
  const { body } = req;

  try {
    validateLoginBody(body);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  let user;
  try {
    const { email, password } = body;
    user = await findUser({ email }, "_id firstName password isVerified");

    const isPasswordCorrect = compareSync(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error("Email o contraseña incorrectas");
    }
    if (!user.isVerified) {
      throw new Error("Debes verificar la cuenta para poder iniciar sesión");
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message ?? "Email o contraseña incorrectas" });
  }

  const jwt = await createJWT({ id: user._id });
  return res.status(200).json({ token: jwt, firstName: user.firstName });
};

router.post("/login", login);

export { router };
