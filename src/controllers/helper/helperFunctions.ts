import { NextFunction, Request, Response } from 'express';
import { optional } from 'joi';
import  prisma  from '../../db/db';
import jwt from 'jsonwebtoken';

const accountSid = process.env.TWILIO_ACCOUNT_SID || null;
const authToken = process.env.TWILIO_AUTH_TOKEN || null; 
console.log(accountSid)
const client = require('twilio')(accountSid, authToken);

export const generateUserToken =async (phoneNumber:string, password:string, secret:string, timeExpiring:string ) => {
  const token = jwt.sign(
        {phoneNumber, password},
        secret, 
        {expiresIn: timeExpiring}, 
    )
    return token;
}

export const jwtVerifyUserToken = async (bearerToken:string, secret:string, callback:any) => {
    jwt.verify(bearerToken, secret, (err, data:any)=>{
        callback(err, data)
   })

  }

export const generateOTP = async (userId:number)=>{
   const otp:number =  Math.floor(Math.random() * 900000) + 100000;
    const isOTPAvailable = await prisma.otp.findFirst({
        where: {
            otp,
            userId
        }
    });

    if (isOTPAvailable) generateOTP(userId);
    
     await prisma.otp.create({
        data:{
            otp,
            userId
        }
    })
    return otp;
    
}
export const deleteOTP =async (userId:number) => {
    const otp = await prisma.otp.findFirst({
        where:{
            userId
        }
    })
    if (otp) {
        await prisma.otp.delete({
            where:{
                id:otp.id
            }
        })
    }
    return 200;

}

export const sendTextMessage =async(phoneNumber:string, message:string) => {
    try {
     const textMessageResponse = await client.messages
                        .create({
                            body: message,
                            from: process.env.TWILIO_PHONE_NUMBER ,
                            to: phoneNumber
                        })
       
        if (textMessageResponse.sid) return ({isMessageSent:true, body:textMessageResponse});
        return textMessageResponse;

    } catch (error:any) {
        return error
    }
}
 