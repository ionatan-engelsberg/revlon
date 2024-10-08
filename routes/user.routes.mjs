import express from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

import { ORDER_TYPE, TICKET_STORE } from "../constants.mjs";

import { createTicket, getContest, getProduct } from "../db/repository.mjs";

const router = express.Router();

const checkIfAuthenticated = (req, res) => {
  if (!req.headers?.authorization) {
    throw new Error("Unauthorized");
  }

  const token = req.headers.authorization.split(' ')[1];

  const decoded = jwt.decode(token);
  if (!decoded) {
    throw new Error("Unauthorized");
  }

  const CURRENT_TIME = Date.now();

  const { data: { id }, exp } = decoded;
  const expiryTime = exp * 1000;

  if (expiryTime < CURRENT_TIME) {
    throw new Error("Unauthorized");
  }

  return id;
};

const validateTicketNumber = (number, store, type) => { };

const validateUploadTicketBody = async (body) => {
  // TODO: Add image, date
  const { number, type, store, barCode, guesses } = body;

  if (
    !type ||
    !store ||
    !number ||
    !barCode ||
    !guesses
  ) {
    throw new Error("Some attribute is missing");
  }

  if (!Object.values(ORDER_TYPE).includes(type)) {
    throw new Error(`Ticket type must be one of the following: ${Object.values(ORDER_TYPE)}`);
  }
  if (!Object.values(TICKET_STORE).includes(store)) {
    throw new Error(`Ticket store must be one of the following: ${Object.values(TICKET_STORE)}`);
  }

  if (typeof guesses != "object" || guesses.length != 2) {
    throw new Error("Incorrect guesses format");
  }

  if (guesses[0].contest == guesses[1].contest) {
    throw new Error("Guess contests must be different");
  }

  for (const g of guesses) {
    if (typeof g.guess != "number") {
      throw new Error("Incorrect guesses format");
    }
    await getContest(g.contest);
  }

  validateTicketNumber(number, store, type);
  const product = await getProduct({ barCode });
  return product;
};

const uploadTicket = async (req, res) => {
  let userId;
  try {
    userId = checkIfAuthenticated(req, res);
  } catch (error) {
    return res.status(401).json({ message: error.message ?? "Unauthorized" })
  }

  let product;
  try {
    product = await validateUploadTicketBody(req.body);
  } catch (error) {
    return res.status(400).json({ message: error.message ?? "Invalid body" });
  }

  const { barCode, number, date, image, store, type, guesses } = req.body;

  try {
    const ticket = {
      user: userId,
      product,
      number,
      date,
      image,
      store,
      type,
      guesses
    };

    await createTicket(ticket);

    return res.status(200).json({ message: "OK" })
  } catch (error) {
    return res.status(500).json({ message: error.message ?? "There was an error while uploading the ticket" });

  }


};

router.post('/', uploadTicket);

const getUserTickets = async (req, res) => {
  let userId;
  try {
    userId = checkIfAuthenticated(req, res);
  } catch (error) {
    return res.status(401).json({ message: error.message ?? "Unauthorized" })
  }
};

router.get('/', getUserTickets);

export { router };
