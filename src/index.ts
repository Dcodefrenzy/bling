import express, { Application, Request, Response, NextFunction } from 'express';
import https from "https";
import cors from "cors";
import morgan from 'morgan';
import bodyParser from "body-parser";
import api from "./router";
//import { logger, stream } from "./logger/logger";
import fs from "fs";
import * as dotenv from 'dotenv' 
dotenv.config()

let req:Request, res:Response
//initialize middlewares
const app :Application = express();

const origins = ['rand'];

var corsOptionsDelegate = function (req: { header: (arg0: string) => string; }, callback: (arg0: null, arg1: { origin: boolean; }) => void) {
    let corsOptions: { origin: boolean; };
    if (origins.indexOf(req.header('Origin')) !== -1) {
        console.log(req.header('Origin'))
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
  }




//app.use(cors(corsOptionsDelegate));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use("/api/v1", api); 
app.use("/test", api);


export default app;