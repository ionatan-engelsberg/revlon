import express from "express";
import jwt from "jsonwebtoken";

import { ORDER_TYPE, TICKET_STORE } from "../constants.mjs";

import { createTicket, getContest, getProduct, getUserTickets } from "../db/repository.mjs";

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

// TODO
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
    throw new Error("Debes completar todos los campos para avanzar");
  }

  if (!Object.values(ORDER_TYPE).includes(type)) {
    throw new Error(`El tipo de compra debe ser uno de los siguientes: ${Object.values(ORDER_TYPE)}`);
  }
  if (!Object.values(TICKET_STORE).includes(store)) {
    throw new Error(`La tienda de compra debe ser una de las siguientes: ${Object.values(TICKET_STORE)}`);
  }

  if (typeof guesses != "object" || guesses.length != 2) {
    throw new Error("Incorrect guesses format");
  }

  if (guesses[0].contest == guesses[1].contest) {
    throw new Error("No puede ingresar dos adivinanzas para el mismo concurso");
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

  const { number, date, image, store, type, guesses } = req.body;

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
    return res.status(500).json({ message: error.message ?? "Ocurrió un error al intentar subir el ticket.Por favor vuelva a intentarlo" });

  }
};

router.post('/', uploadTicket);

const getTicketsFromUser = async (req, res) => {
 let userId;
  try {
    userId = checkIfAuthenticated(req, res);
  } catch (error) {
    return res.status(401).json({ message: error.message ?? "Unauthorized" })
  }

  try {
    const tickets = await getUserTickets(userId);
    return res.status(200).json(tickets)
  } catch (error) {
    return res.status(500).json({ message: "Ocurrió un error en el servidor. Por favor vuelva a intentarlo" });
  }
};

router.get('/', getTicketsFromUser);

export { router };
