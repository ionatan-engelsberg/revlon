import { Schema, model } from "mongoose";

export const ContestSchema = new Schema({
  answer: {
    type: Number,
    required: [true, 'Contest answer is required'],
    min: 0
  },
  image: {
    type: String,
    required: [true, 'Contest image is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Contest start date is required']
  },
  endDate: {
    type: String,
    required: [true, 'Contest end date is required']
  },
  main: {
    type: Boolean,
    default: false
  }
},
  { timestamps: true, versionKey: false });

export const ContestModel = model('Contest', ContestSchema);