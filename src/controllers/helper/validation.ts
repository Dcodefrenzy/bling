import Joi from 'joi';
import { max } from 'lodash';


//Here is where we validate, you can chek Joi for more info about how it works.

let message =  {
                'string.empty': `empty`,
                'any.required': `required`, 
                'string.email':'invalid_mail', 
                'string.min': 'input_invalid_length', 
                'string.max':'input_too_long',
              }

export const userSignUpValidation = Joi.object({
  email: Joi.string().email().lowercase().required().messages(message),
  password: Joi.string().min(6).required().messages(message),
  firstName: Joi.string().required().messages(message),
  lastName: Joi.string().required().messages(message),
  phoneNumber: Joi.string().min(9).required().messages(message),
});
export const userUpdateValidation  = Joi.object({
  email:Joi.string().email().lowercase().required().messages(message),
  firstName: Joi.string().required().messages(message),
  lastName: Joi.string().required().messages(message),
  user: Joi.any(),
  tokenValue:Joi.any()

});
export const loginValidation = Joi.object({
  phoneNumber: Joi.string().min(9).required().messages(message),
  password: Joi.string().min(6).required().messages(message),
});
export const updatePasswordValidation = Joi.object({
  oldPassword: Joi.string().min(6).required().messages(message),
  newPassword: Joi.string().min(6).required().messages(message)
});
export const passwordValidation = Joi.object({ password: Joi.string().min(6).required().messages(message), });



