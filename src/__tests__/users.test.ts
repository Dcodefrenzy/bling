import { send } from "process";
import request from "supertest";
import app from '../index';
import prisma from '../db/db';
import { userInfo } from "os";
import { UserType } from "../types/types";



beforeAll(async() => (await prisma.otp.deleteMany({})))
beforeAll(async() => (await prisma.user.deleteMany({})))



describe("Register User", ()=>{
    let otpToken:string;
    let userToken: string;

    const user:UserType = {
        email: "user1@gmail.com",
        password: "123456",
        lastName: "Doe",
        firstName: "John",
        phoneNumber: "+491776459263",
    }

    it('POST/ Validate and Create a User', async ()=>{
        const response = await request(app)
            .post("/test/users/create")
            .send(user)
            .expect(201)
            .expect('Content-Type', /json/)
            .then((response)=>{
                otpToken = response.body.otpToken;
                expect(response.body).toEqual(
                    expect.objectContaining({
                        message:"User Registration Successful",
                        status:201,
                        otpToken:expect.any(String),
                        user: expect.objectContaining({
                            id: expect.any(Number),
                            email:"user1@gmail.com",
                            lastName: "Doe",
                            firstName: "John",
                            phoneNumber: "+491776459263",
                        })
                    })
                );
            })

    });


    it('POST/ Should not Add Duplicate User', async ()=>{
        const response = await request(app)
            .post("/test/users/create")
            .send(user)
            .expect(500);
        expect(response.body).toEqual('Duplicate/ User already Exist.');
    });

    const badUser = {
        email: 'ayo@gmail.com',
        password: "1234djdn",
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber:"1234"
    } 

    it('POST/ Should not Validate or Create a User Input', async ()=>{
        const response = await request(app)
            .post("/test/users/create")
            .send(badUser)
            .expect(400);
        expect(response.body).toEqual(
            expect.objectContaining({
                errorCode: expect.any(Number),
                errorLabel: expect.any(String),
                errorMessage: expect.any(String),
                errorType: expect.any(String),
                errorAction: expect.any(String),
            })
        );
    });

    // it('GET USERS', async ()=>{
    //     const response = await request(app)
    //         .get('/test/users/')
    //         .expect('Content-Type', /json/)
    //         .expect(200)
    //         .then((response)=>{
    //             expect(response.body).toEqual(
    //                 expect.arrayContaining([
    //                     expect.objectContaining({
    //                         email: expect.any(String),
    //                         id: expect.any(Number),
    //                         lastname: expect.any(String),
    //                         firstname:expect.any(String),
    //                         role:expect.any(String),
    //                         creationDate:expect.any(String),
    //                         lastUpdated :expect.any(String)
    //                     })
    //                 ])
    //             )
    //             user_id = response.body[0].id;
    //         })

        
    // });
    // it("GET/ Should return a user", async ()=>{
    //     const response = await request(app)
    //         .get(`/test/users/${user_id}`)
    //         .expect('Content-Type', /json/)
    //         .expect(200);
    //     expect(response.body).toEqual(
    //         expect.objectContaining({
    //             email: expect.any(String),
    //             id: expect.any(Number),
    //             lastname: expect.any(String),
    //             firstname:expect.any(String),
    //             role:expect.any(String),
    //             creationDate:expect.any(String),
    //             lastUpdated :expect.any(String)
    //         })
    //     );
    // });

    // it("GET/ Should return  not Return a user", async ()=>{
    //     const response = await request(app)
    //         .get(`/test/users/${user_id + 1}`)
    //         .expect('Content-Type', /json/)
    //         .expect(404);
    //     expect(response.body).toEqual(
    //         expect.objectContaining({
    //             errorCode: expect.any(Number),
    //             errorLabel: expect.any(String),
    //             errorMessage: expect.any(String),
    //             errorType: expect.any(String),
    //             errorAction: expect.any(String),
    //         })
    //     );
    // });

    it("GET/ Should verify user login details and send OTP", async ()=>{
        const response = await request(app)
            .post(`/test/users/login`)
            .send({phoneNumber:user.phoneNumber, password:user.password})
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                otpToken = response.body.otpToken;
                expect(response.body).toEqual(
                    expect.objectContaining({
                        otpToken:expect.any(String),
                        message: "User Login Successful",
                        status: 200,
                        user: expect.objectContaining({
                            id: expect.any(Number),
                            email:"user1@gmail.com",
                            lastName: "Doe",
                            firstName: "John",
                            phoneNumber: "+491776459263",
                        }),
                    })
                    
                );
            })

    });


    it("GET/ Should verify user OTP and login", async ()=>{
        const registredUser = await prisma.user.findFirst({
            where:{phoneNumber:user.phoneNumber},
            include:{
                userOTP:true
            }
        })
     
         await request(app)
            .post(`/test/users/verify-otp`)
            .set("authorization", otpToken)
            .send({otp:registredUser?.userOTP[0].otp})
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response)=>{
                
                userToken = response.body.userToken;
                expect(response.body).toEqual(
                    expect.objectContaining({
                        userToken:expect.any(String),
                        message: "OTP Verified Successfully",
                        status: 200,
                    })
                );
            })
    });

    it("GET/ Should Update User Info", async ()=>{

         await request(app)
            .patch(`/test/users/update`)
            .set("authorization", userToken)
            .send({email:"dee@gmail.com", firstName:"Sam", lastName:"Doe"})
            .expect('Content-Type', /json/)
            .expect(201)
            .then((response)=>{
                expect(response.body).toEqual(
                    expect.objectContaining({
                        message: "User updated successfully",
                        status: 201,
                    })
                );
            })
    });


    it("GET/ Should process changed password", async ()=>{

        await request(app)
           .post(`/test/users/change-password`)
           .set("authorization", userToken)
           .send({oldPassword:user.password, newPassword:"000000"})
           .expect('Content-Type', /json/)
           .expect(201)
           .then((response)=>{
                otpToken = response.body.otpToken;
                expect(response.body).toEqual(
                    expect.objectContaining({
                        otpToken:expect.any(String),
                        message: "User Password OTP Sent",
                        status: 201,
                        user: expect.objectContaining({
                            id: expect.any(Number),
                            email:"dee@gmail.com",
                            lastName: "Doe",
                            firstName: "Sam",
                            phoneNumber: "+491776459263",
                        }),
                    })
                );
           })
   });


   it("GET/ Should update new password", async ()=>{
    const registredUser = await prisma.user.findFirst({
        where:{phoneNumber:user.phoneNumber},
        include:{
            userOTP:true
        }
    })
    await request(app)
       .put(`/test/users/update-password`)
       .set("authorization", otpToken)
       .send({otp:registredUser?.userOTP[registredUser?.userOTP.length -1].otp})
       .expect('Content-Type', /json/)
       .expect(201)
       .then(async (response)=>{
            await request(app)
            .post(`/test/users/login`)
            .send({phoneNumber:user.phoneNumber, password:"000000"})
            .expect('Content-Type', /json/)
            .expect(200)
           expect(response.body).toEqual(
               expect.objectContaining({
                    message: "Password Updated",
                    status: 201,
               })
           );
       })
    });


   
})




