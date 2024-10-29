import express from "express";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

import { ORDER_TYPE, TICKET_STORE, ALLOWED_ONLINE_STORES, ALLOWED_PHYSICAL_STORES } from "../constants.mjs";

import { createTicket, getContest, getProduct, getUserTickets } from "../db/repository.mjs";

const router = express.Router();
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

cloudinary.config(
  {
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  }
);

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

const validateTicket = (number, store, type) => {
  if (!Object.values(ORDER_TYPE).includes(type)) {
    throw new Error(`El tipo de compra debe ser uno de los siguientes: ${Object.values(ORDER_TYPE)}`);
  }
  if (!Object.values(TICKET_STORE).includes(store)) {
    throw new Error(`La tienda de compra debe ser una de las siguientes: ${Object.values(TICKET_STORE)}`);
  }
  if (type == ORDER_TYPE.ONLINE && !ALLOWED_ONLINE_STORES.includes(store)) {
    throw new Error(`Las tiendas online permitidas son las siguientes: ${Object.values(ALLOWED_ONLINE_STORES)}`);
  }
  if (type == ORDER_TYPE.PHYSICAL && !ALLOWED_PHYSICAL_STORES.includes(store)) {
    throw new Error(`Las tiendas físicas permitidas son las siguientes: ${Object.values(ALLOWED_PHYSICAL_STORES)}`);
  }

  // TODO
  // if (number.length < 10) {
  //   throw new Error("El n° de ticket debe tener al menos 10 caracteres");
  // }
};

const validateUploadTicketBody = async (body) => {
  const { number, type, store, barCode, guesses, date, image: imageId } = body;

  if (
    !type ||
    !store ||
    !number ||
    !barCode ||
    !guesses ||
    (type == ORDER_TYPE.ONLINE && !date)
  ) {
    throw new Error("Debes completar todos los campos para avanzar");
  }

  validateTicket(number, store, type);

  if (typeof guesses != "object" || guesses.length != 2) {
    throw new Error("Incorrect guesses format");
  }

  if (guesses[0].contest == guesses[1].contest) {
    throw new Error("No puede ingresar dos adivinanzas para el mismo concurso");
  }

  let mainAmount = 0;
  for (const g of guesses) {
    if (typeof g.guess != "number") {
      throw new Error("Incorrect guesses format");
    }
    const contest = await getContest(g.contest, "_id main startDate endDate");

    const { startDate, endDate, main } = contest;

    if (Date.now() < startDate.getTime() || Date.now() > endDate.getTime()) {
      throw new Error("El concurso seleccionado ya expiró o no ha comenzado aún");
    }

    if (main) {
      mainAmount++
    }
  }

  if (mainAmount != 1) {
    throw new Error("Debes enviar adivinanzas para un concurso semanal y un concurso principal");
  }

  let imageUrl;
  try {
    const cloudinaryAsset = await cloudinary.api.resource(imageId);
    if (!cloudinary.url){
      throw new Error("La imagen subida es inválida");
    }

    imageUrl = cloudinaryAsset.url;
  } catch (error) {
    throw new Error("La imagen subida es inválida");
  }

  const product = await getProduct({ barCode });
  return { product, imageUrl };
};

const uploadTicket = async (req, res) => {
  let userId;
  try {
    userId = checkIfAuthenticated(req, res);
  } catch (error) {
    return res.status(401).json({ message: error.message ?? "Unauthorized" })
  }

  let product;
  let imageUrl;
  try {
    const validationResult = await validateUploadTicketBody(req.body);
    product = validationResult.product;
    imageUrl = validationResult.imageUrl;
  } catch (error) {
    return res.status(400).json({ message: error.message ?? "Invalid body" });
  }

  const { number, date, store, type, guesses } = req.body;

  try {
    const ticket = {
      user: userId,
      product,
      number,
      date: type == ORDER_TYPE.ONLINE ? date : new Date(Date.now()),
      image: imageUrl,
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

const generateApiSignature = async (req, res) => {
  try {
    checkIfAuthenticated(req, res);
  } catch (error) {
    return res.status(401).json({ message: error.message ?? "Unauthorized" })
  }

  try {
    const timestamp = Math.round((new Date).getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'Revlon/Tickets'
      },
      CLOUDINARY_API_SECRET
    );

    return res.status(200).json({ timestamp, signature })
  } catch (error) {
    res.status(500).json({ message: "Hubo un error en el servidor. Por favor vuelva a intentarlo más tarde" })
  }
};

router.get('/image_signature', generateApiSignature);

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
