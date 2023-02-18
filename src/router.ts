import express from "express";
import userRouter from './controllers/user/user_route';


const api = express.Router();

api.use("/users", userRouter);



export default api;