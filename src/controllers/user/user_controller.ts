import { NextFunction, Request, Response } from 'express';
import {  User } from "@prisma/client";
import  prisma  from '../../db/db';
import bcrypt from 'bcrypt';
import {omit} from 'lodash';
import { logger } from '../../logger/logger';
import { 
        userSignUpValidation, 
        loginValidation, 
        passwordValidation, 
        updatePasswordValidation, 
        userUpdateValidation,  
     } from '../helper/validation';

import  { postRequestError, 
        updateRequestError, 
        getParamRequestError, 
        deleteRequestError, 
        requestNotFoundError, 
        duplicateRequestError, 
        incorrectRequestError 
    } from '../../errors/app_errors';
import { UserType } from '../../types/types';
import { generateOTP, generateUserToken, jwtVerifyUserToken, sendTextMessage } from '../helper/helperFunctions';

const  saltRounds = 10; 
const statusCOde = {createdStatus:201, successStatus:200}

//Create a User
const handleTwoFactorAuthentication = async (user:User, message:string, statusCOde:number) => {
        //Generate OTP
        const otp:number = await generateOTP(user.id) || 0;

        //Send SMS verificaiton Using Twillo
        const textMessageResponse = await sendTextMessage(user.phoneNumber, otp.toString());

        if (textMessageResponse.isMessageSent) {
            //create a tempoary Otp token using Jsonwebtoken
            const otpToken = await generateUserToken(user.phoneNumber, user.password, process.env.DUMMY_SECRETE || "null", "5m");

                  return  {isMessageSend:textMessageResponse.isMessageSent,                      
                            body:{
                                    status:statusCOde,
                                    otpToken,
                                    message:message,
                                    user: omit(user, 'password', 'lastUpdated', 'creationDate')
                            }
                        }    
            
        }else{
            let  error = postRequestError({label:"phoneNumber", message:textMessageResponse.RestException}); 
            return {isMessageSend:false, error:error}; 
        }
}


export const createUserHandler = async (req:Request, res:Response)=>{
    try {
        
        const userRequest:UserType = await userSignUpValidation.validateAsync(req.body); 
        const hashedPassword = await bcrypt.hash(userRequest.password, saltRounds);

        const user = await prisma.user.create({
            data: {
                email: userRequest.email,
                password: hashedPassword,
                firstName: userRequest.firstName,
                lastName: userRequest.lastName,
                phoneNumber: userRequest.phoneNumber,
            }
        })

            //Validate user by sending sms
           const textMessageResponse = await handleTwoFactorAuthentication(user, "User Registration Successful", statusCOde.createdStatus);

            if (textMessageResponse.isMessageSend) return res.status(statusCOde.createdStatus).send(textMessageResponse.body)
            else return res.status(400).json(textMessageResponse.error); 

    } catch (error:any) {
        
        logger.error(error.message); 
        if (error.isJoi === true) {
            let  e = postRequestError(error); 
            res.status(e.errorCode).json(e);  
            return; 
        }
        res.status(500).json("Duplicate/ User already Exist.");
        return;
          
    }
}

//Get all users
export const getUsersHandler =async (req:Request, res:Response) => {

    const users:User[] = await prisma.user.findMany({});
    res.status(200).send(users);
}


//Get all user
export const getUserMiddlewareHandler =async (req:Request, res:Response) => {
    const id : number = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
        where: {
            id:id
        }
    });
    if (!user) {
     const e = requestNotFoundError({label:"User"});
     res.status(e.errorCode).json(e);
     return;   
    }
    res.status(200).json(omit(user, 'password'));
    return;
}

//Log a User In
export const userLoginHandler =async (req:Request, res:Response) => {
  try {
    const userData = await loginValidation.validateAsync(req.body);
    const user = await prisma.user.findUnique({
            where: {
            phoneNumber: userData.phoneNumber,
            },
      });
      if (!user) {
        const e = requestNotFoundError({label:"User"});
        res.status(e.errorCode).json(e);
        return; 
      }else {
        const passwordValid = await bcrypt.compare(userData.password, user.password);
        if (passwordValid) {
                

                const textMessageResponse = await handleTwoFactorAuthentication(
                                                        user, "User Login Successful", 
                                                        statusCOde.successStatus
                                                    );

                if (textMessageResponse.isMessageSend) 
                    return res.status(statusCOde.successStatus).send(textMessageResponse.body)
                else 
                    return res.status(400).json(textMessageResponse.error); 

        }else if (!passwordValid) {
            const e = incorrectRequestError({label:"email/password"});
            res.status(e.errorCode).send({error:e});
            return;
        }
    }
    } catch (error:any) {
        logger.error(error);
        if (error.isJoi === true) {
            logger.error(error);
            let  e = postRequestError(error.details[0]); 
          res.status(e.errorCode).send({  error:e });
          return;
        }
        res.status(500).send("something went wrong here."); 
    }

}

export const verifyUserOTPHandler =async (req:Request, res:Response) => {
    try {
        const user = req.body.user;
        const otp = await prisma.otp.findFirst({
            where:{
                otp:req.body.otp,
                userId:user.id
            }
        });
        if (otp) {
            // create a userToken
                const userToken = await generateUserToken(
                                                        user.phoneNumber, 
                                                        user.password, process.env.JWT_SECRET || "null", 
                                                        process.env.JWT_EXPIRESIN || "null"
                                                    );
    
            //delete otp
            await prisma.otp.delete({
                where:{
                    id:otp.id
                }
            });
    
            //send user response
            
            res.status(200).send({
                            status:200, 
                            message: "OTP Verified Successfully", 
                            userToken
                        });
        }else{
            const e = incorrectRequestError({label:"OTP"});
            res.status(e.errorCode).send({error:e});
            return;
        }
    } catch (error:any) {
            logger.error(error);
            res.status(500).send("something went wrong here."); 
      }

}

export const updateUserHandler =async (req:Request, res:Response) => {
    try {
    
        const userRequest:UserType = await userUpdateValidation.validateAsync(req.body); 
        console.log(req.body.user)
        const updatedUser = await prisma.user.update({
            where:{
                id:req.body.user.id
            },
            data:{
                email:userRequest.email,
                firstName:userRequest.firstName,
                lastName:userRequest.lastName
            }
        });
        
        return res
                .status(statusCOde.createdStatus)
                    .send({
                        status:statusCOde.createdStatus, 
                        message:"User updated successfully"
                    });

    } catch (error:any) {
        console.log(error)
        logger.error(error);
        if (error.isJoi === true) {
            logger.error(error);
            let  e = postRequestError(error.details[0]); 
        res.status(e.errorCode).send({  error:e });
        return;
        }
        res.status(500).send("something went wrong here."); 
    }
}

export const changePasswordHandler =async (req:Request, res:Response) => {
    try {
        const user = req.body.user
        const passwordData = await updatePasswordValidation
                                            .validateAsync({
                                                oldPassword:req.body.oldPassword, 
                                                newPassword:req.body.newPassword
                                            });
  

        const passwordValid = await bcrypt
                                    .compare(passwordData.oldPassword, user.password);

        //mutiate the present password with the new password 
        //This will create  an OPT token to keep the state of the new password  inside the OTP
        //This will be saved after the OTP as been validated
         
        user.password = passwordData.newPassword;
        if (passwordValid) {
                const textMessageResponse = await handleTwoFactorAuthentication(user, "User Password OTP Sent", statusCOde.createdStatus);

                if (textMessageResponse.isMessageSend) return res.status(statusCOde.createdStatus).send(textMessageResponse.body)
                else return res.status(400).json(textMessageResponse.error); 

        }else if (!passwordValid) {
            const e = incorrectRequestError({label:"password"});
            res.status(e.errorCode).send({error:e});
            return;
        }
      } catch (error:any) {
        console.log(error)
          logger.error(error);
          if (error.isJoi === true) {
              logger.error(error);
              let  e = postRequestError(error.details[0]); 
            res.status(e.errorCode).send({  error:e });
            return;
          }
          res.status(500).send("something went wrong here."); 
      }
  
  }
  export const updateUserPasswordHandler =async (req:Request, res:Response) => {
    try {
        const user = req.body.user;
        const newPassword =  await bcrypt.hash(req.body.tokenValue.password, saltRounds);

        const otp = await prisma.otp.findFirst({
            where:{
                otp:req.body.otp,
                userId:user.id
            }
        });
        if (otp) {
            // create a userToken
                await prisma.user.update({
                    where:{
                        id:user.id
                    },
                    data:{
                        password:newPassword
                    }
                })
            //delete otp
            await prisma.otp.delete({
                where:{
                    id:otp.id
                }
            });
    
            //send user response
            
            res.status(201).send({
                            status:201, 
                            message: "Password Updated", 
                        });
        }else{
            const e = incorrectRequestError({label:"OTP"});
            res.status(e.errorCode).send({error:e});
            return;
        }
    } catch (error:any) {
            logger.error(error);
            res.status(500).send("something went wrong here."); 
      }
  }