import { Schema, model } from "mongoose";

export const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  sku: {
    type: String,
    required: [true, 'Product sku is required'],
    unique: true
  },
  barCode: {
    type: String,
    required: [true, 'Product bar code is required'],
    unique: true
  }
},
  { timestamps: true, versionKey: false });

export const ProductModel = model('Product', ProductSchema);