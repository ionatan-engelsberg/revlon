import { Schema, model } from "mongoose";

import { TICKET_STORE, ORDER_TYPE } from "../../constants.mjs";

const GuessSchema = new Schema({
  contest: {
    type: Schema.Types.ObjectId,
    ref: 'Contest',
    required: [true, 'Guess contest is required']
  },
  guess: {
    type: Number,
    required: [true, 'Guess is required'],
    min: 0
  }
});

export const TicketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, 'Ticket user is required'],
    ref: 'User'
  },
  product: {
    type: Schema.Types.ObjectId,
    required: [true, 'Ticket product is required'],
    ref: 'Product'
  },
  number: {
    type: String,
    required: [true, 'Ticket number is required']
  },
  date: {
    type: Date,
    required: [true, 'Ticket date is required']
  },
  image: {
    type: String,
    required: [true, 'Ticket image is required']
  },
  store: {
    type: String,
    required: ["Ticket store is required"],
    enum: {
      values: Object.values(TICKET_STORE),
      message: `Ticket store must be one of the following: ${Object.values(TICKET_STORE)}`
    }
  },
  type: {
    type: String,
    required: ["Ticket type is required"],
    enum: {
      values: Object.values(ORDER_TYPE),
      message: `Ticket type must be one of the following: ${Object.values(ORDER_TYPE)}`
    }
  },
  guesses: {
    type: [GuessSchema],
    required: [true, 'Guesses are required'],
    min: 2,
    max: 2
  }
},
  { timestamps: true, versionKey: false });

export const TicketModel = model('Ticket', TicketSchema);