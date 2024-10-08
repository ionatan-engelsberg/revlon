import express from 'express';
import bodyParser from 'body-parser';
import { connect } from "mongoose";
import { config } from 'dotenv';

import { router as authRouter } from './routes/auth.routes.mjs';
import { router as userRouter } from './routes/user.routes.mjs';

config();

const app = express().use(bodyParser.json());

const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_APP_NAME } = process.env;
const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}.84aml.mongodb.net/?retryWrites=true&w=majority&appName=${MONGODB_APP_NAME}`;

const PORT = process.env.PORT || 8080;

app.use('/auth', authRouter);
app.use('/tickets', userRouter);

connect(MONGODB_URI)
  .then(() => {
    console.log(`Server running on port ${PORT}...`);
    app.listen(PORT)
  })
  .catch((error) => {
    console.log("ERROR: ", error);
  });
