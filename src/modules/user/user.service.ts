import { Request, Response } from "express";
import { CreateUserDto, LoginUserDto } from "./user.dto";
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";
// import {  Model } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { AppError } from "../../utils/response/app.Error";
import { compareHash, generateHash } from './../../utils/security/hash.security';
import emailEvent from "../../utils/event/email.event";
import { generateOtp } from "../../utils/otp";
import { createCredentialToken } from './../../utils/security/token.security';


class UserService {
    private userModel = new DatabaseRepositry<IUser>(UserModel);


    signUp = async (req:Request,res:Response):Promise<Response>=>{ 

        const {firstName,lastName,email,password,confirmPassword,role}:CreateUserDto = req.body;


        const otp = generateOtp();

        const [user] = await this.userModel.create({

            data:[{firstName,lastName,email,role,confirmPassword,password:await generateHash(password),confirmEmailOtp:await generateHash(String(otp))}],
            options:{validateBeforeSave:true},
        })||[];

        if(!user){
           throw new AppError("fail to create user",404);
        }



        emailEvent.emit("confirmEmail",{to:email,otp});



        return res.status(201).json({message:"user created successfully",data:{user}});

    }

    confirmEmail= async (req:Request,res:Response):Promise<Response>=>{

        const {email,otp} = req.body;

        const user = await this.userModel.findOne({
            filter:{
                email,
                confirmEmailOtp:{$exists:true},
                confirmAT:{$exists:false},
            }
        });


        if(!user){
            throw new AppError("user not found",404);
        }

        if(!await compareHash(otp,user.confirmEmailOtp as string)){
            throw new AppError("invalid otp",400);
        }

        await this.userModel.updateOne(
            {
                filter:{email},
                update:{
                    confirmAT:new Date(),
                    $unset:{confirmEmailOtp:true}
                }
            }
        )



        return res.status(200).json({message:"email confirmed successfully"});




    }

    login = async (req:Request,res:Response):Promise<Response>=>{


        const {email,password}:LoginUserDto = req.body;

        const user = await this.userModel.findOne({
            filter:{email}
        });

        if(!user){
            throw new AppError("user not found",404);
        }

        if(!user.confirmAT){
            throw new AppError("email not confirmed",400);
        }


        if(!await compareHash(password,user.password)){
            throw new AppError("invalid password",400);
        }

        const Credentials = await createCredentialToken(user);


        return res.status(200).json({message:"login successfully",data:{Credentials}});








    }

    


}


export default new UserService;