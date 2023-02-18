import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logger/logger';
import { jwtVerifyUserToken } from './helperFunctions';

import  prisma  from '../../db/db';
import { requestNotFoundError } from '../../errors/app_errors';
import { AppError } from '../../types/types';
import { User } from '@prisma/client';



const getToken = async (bearerHeader:string)=>{
    let token:string;
    const postManToken = bearerHeader.split(' ')[1];
    if (postManToken == undefined) {
        token = bearerHeader;
    }else{
        token = postManToken;
    }
    return token;
}

const fetchUser =async (phoneNumber:string, password:string, callback:any) => {
    try {
        const user = await prisma.user.findUnique({
            where:{
                phoneNumber
            }
        });
        if (!user) {
            const error = requestNotFoundError({label:"User"});
            callback({error})
        }else{
            callback({user})
        }

    } catch (error:any) {
        callback({error})
    }
}

const passUserToMiddleware =async ( req:Request, res:Response, next:NextFunction,  userData:any, tokenValue:any) => {

    if (userData.error) {
        console.log(userData.error)
        res.status(userData.error.errorCode).send(userData.error);
        return
    }
   
    req.body.user = userData.user;
    //tokenValue is email and password sign as token.
    req.body.tokenValue = tokenValue;
    next();
}

export const otpAuthentication =async (req:Request, res:Response, next:NextFunction) => {
    const bearerHeader = req.headers['authorization'];
    
    if (!bearerHeader) {
       
        logger.error("Something went wrong at Token Bearer Validation")
        return res.status(401).send({status:401, message:"unauthorised access"});
    }

    const token = await getToken(bearerHeader);

    jwtVerifyUserToken(token, process.env.DUMMY_SECRETE || "null", (err: any, otpTokenValue: any)=>{
        if (err) {
            logger.error("Something went wrong at JWT Token Validation");
            logger.error(err);
            return res.status(401).send({status:401, message:"unauthorised access", err:err});
        }else{
            //find user who the token belongs      
             fetchUser(otpTokenValue.phoneNumber, otpTokenValue.password, (userdata:any)=>{
                passUserToMiddleware(req, res, next, userdata, otpTokenValue)
            })
        }
    })
}


export const authentication =async (req:Request, res:Response, next:NextFunction) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        logger.error("Something went wrong at Token Bearer Validation")
        return res.status(401).send({status:401, message:"unauthorised access"});
    }

    const token = await getToken(bearerHeader);

    jwtVerifyUserToken(token, process.env.JWT_SECRET || "null", (err: any, userTokenValue: any)=>{
        if (err) {
            logger.error("Something went wrong at JWT Token Validation");
            logger.error(err);
            return res.status(401).send({status:401, message:"unauthorised access", err:err});
        }else{
            //find user who the token belongs
          
             fetchUser(userTokenValue.phoneNumber, userTokenValue.password, (userdata:any)=>{
                passUserToMiddleware(req, res, next, userdata, userTokenValue)
            })
        }
    })
}