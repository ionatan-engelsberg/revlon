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

