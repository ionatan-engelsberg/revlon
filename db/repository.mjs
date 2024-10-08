import { Error } from "mongoose";

import { UserModel } from "./models/User.model.mjs";
import { TicketModel } from "./models/Ticket.model.mjs";
import { ContestModel } from "./models/Contest.model.mjs";
import { ProductModel } from "./models/Product.model.mjs";

const DUPLICATE_VALUE_ERROR_CODE = 11000;

const handleMongoError = (error) => {
  if (error.code === DUPLICATE_VALUE_ERROR_CODE) {
    throw new Error(`Duplicate key value: ${error.keyValue}`);
  }

  if (error instanceof Error.ValidationError) {
    throw new Error(error.message);
  }
};

export const findUser = async (filter, fields) => {
  let user;
  const selectedFields = fields ?? "_id";

  try {
    user = await UserModel.findOne(filter).select(selectedFields);
  } catch (error) {
    handleMongoError(error);
    user = null;
  }

  if (!user) {
    throw new Error('User with provided filter does not exist');
  }

  return user;
};

export const createUser = async (user) => {
  const dbUser = new UserModel(user);

  try {
    await dbUser.save();
  } catch (error) {
    handleMongoError(error);
    throw new Error(error.message ?? 'There was an error while creating the User');
  }

  return dbUser;
};

export const updateUser = async (filter, updatedData) => {
  try {
    const res = await UserModel.updateOne(filter, updatedData);

    if (res.nModified <= 0) {
      throw new Error("Internal server error");
    }
  } catch (error) {
    throw new Error(error.message ?? "Internal server error");
  }
};

export const getProduct = async (filter, fields) => {
  let product;
  const selectedFields = fields ?? "_id";

  try {
    product = await ProductModel.findOne(filter).select(selectedFields);
  } catch (error) {
    handleMongoError(error);
    product = null;
  }

  if (!product) {
    throw new Error('Product with provided filter does not exist');
  }

  return product;
};

export const createTicket = async (ticket) => {
  const dbTicket = new TicketModel(ticket);

  try {
    await dbTicket.save();
  } catch (error) {
    handleMongoError(error);
    throw new Error(error.message ?? 'There was an error while creating the Ticket');
  }

  return dbTicket;
};

export const getUserTickets = async (userId) => {
  let tickets;
  const fields = "_id number date image store type guesses";

  try {
    tickets = await TicketModel.find({ user: userId }).select(fields);
  } catch (error) {
    handleMongoError(error);
    tickets = [];
  }

  return tickets;
};

export const getContest = async (contestId, fields) => {
  let contest;
  const selectedFields = fields ?? "_id";

  try {
    contest = await ContestModel.findById(contestId).select(selectedFields);
  } catch (error) {
    handleMongoError(error);
    contest = null;
  }

  if (!contest) {
    throw new Error('Contest with provided filter does not exist');
  }

  return contest;
};