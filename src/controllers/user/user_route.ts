import { 
        createUserHandler, 
        getUserMiddlewareHandler, 
        getUsersHandler, 
        userLoginHandler, 
        verifyUserOTPHandler,
        updateUserHandler,
        changePasswordHandler,
        updateUserPasswordHandler
    } from "./user_controller";
//import {otpAuthentication, authentication } from "../helper/authentication";

import express from "express";
import { authentication, otpAuthentication } from "../helper/authentication";
const userRouter = express.Router();

//userRouter.route("/authentication").get(authentication, verification);


userRouter.route('/')
    .get(getUsersHandler)

userRouter.route('/create')
    .post(createUserHandler)

userRouter.route('/login')
        .post(userLoginHandler)

userRouter.route('/verify-otp')
    .post(otpAuthentication, verifyUserOTPHandler)


userRouter.route('/update')
    .patch(authentication, updateUserHandler)

userRouter.route('/change-password')
        .post(authentication, changePasswordHandler)

userRouter.route('/update-password')
            .put(otpAuthentication, updateUserPasswordHandler)

userRouter.route('/:id').
    get(getUserMiddlewareHandler)






export default userRouter;
