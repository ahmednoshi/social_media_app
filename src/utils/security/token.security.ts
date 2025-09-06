import { sign, verify } from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { HUserDocument, RoleEnum } from "../../DB/models/user.model";
import { JwtPayload } from './../../../node_modules/@types/jsonwebtoken/index.d';
import { AppError } from "../response/app.Error";
import { UserModel } from './../../DB/models/user.model';
import { DatabaseRepositry } from "../../DB/repositry/database.repositry";


export enum signatureLevelEnum {
    Bearer = "Bearer",
    admin = "admin",

}

export enum tokenTypeEnum {
    access = "access",
    refresh = "refresh",
}

export const generateToken = async ({
    payload,
    secretKey = process.env.SECRET_KEY as string,
    options = { expiresIn: Number(process.env.TOKEN_EXPIRES_IN) }, 
}:{
    payload: object;
    secretKey?: Secret;
    options?: SignOptions;
}): Promise<string> => {
    return sign(payload, secretKey, options);
};


export const verifyToken = async ({
    token,
    secretKey = process.env.SECRET_KEY as string,
}:{
    token: string;
    secretKey: Secret;
}): Promise<JwtPayload> => {
    return verify(token, secretKey) as JwtPayload;
};


export const detectSingnatureLevel = async(role:RoleEnum=RoleEnum.user):Promise<signatureLevelEnum>=>{
    let signatureLevel:signatureLevelEnum =  signatureLevelEnum.Bearer;

    switch(role){
        case RoleEnum.admin:
            signatureLevel = signatureLevelEnum.admin;
            break;
            default:
            signatureLevel = signatureLevelEnum.Bearer;
            break;
    }

    return signatureLevel;

}


export const getSignature = async(SingnatureLevel:signatureLevelEnum=signatureLevelEnum.Bearer):Promise<{access_token:string,refresh_token:string}>=>{

    let segnatures:{access_token:string,refresh_token:string} = {access_token: "", refresh_token:""};



    switch(SingnatureLevel){
        case signatureLevelEnum.admin:
            segnatures.access_token = process.env.SECRET_KEY_ADMIN as string;
            segnatures.refresh_token = process.env.SECRET_KEY_REFRESH_ADMIN as string;
            break;
            default:
            segnatures.access_token = process.env.SECRET_KEY as string;
            segnatures.refresh_token = process.env.SECRET_KEY_REFRESH as string;
            break;

    }


    return segnatures;




}


export const createCredentialToken = async (user:HUserDocument)=>{

    const signatureLevel = await detectSingnatureLevel(user.role);
    const signature = await getSignature(signatureLevel);
    console.log({signature});
    

        const accessToken = await generateToken({
            payload:{_id:user._id},
            secretKey:signature.access_token,
            options:{expiresIn:Number(process.env.TOKEN_EXPIRES_IN)}
            
        });



        const refreshToken = await generateToken({
            payload:{_id:user._id},
            secretKey:signature.refresh_token,
            options:{expiresIn:Number(process.env.TOKEN_EXPIRES_IN_REFRESH)}
        });


        return {accessToken,refreshToken};

}



export const decodeToken = async({authorization,tokenType=tokenTypeEnum.access}:{
    authorization:string,
    tokenType?:tokenTypeEnum
})=>{

    const userModel = new DatabaseRepositry(UserModel);
    const [bearerKey , token] = authorization.split(" ");

    if(!token || !bearerKey){
        throw new AppError("token is required",400);
    }

    const signatures = await getSignature(bearerKey as signatureLevelEnum);

    const decoded = await verifyToken({
        token,
        secretKey:tokenType===tokenTypeEnum.refresh?signatures.refresh_token:signatures.access_token
    });


    if(!decoded._id || !decoded.iat){
        throw new AppError("invalid token",400);
    }


    const user = await userModel.findOne({
        filter:{_id:decoded._id}
    });


    if(!user){
        throw new AppError("user not found",404);
    }


    return {user,decoded}

    
}






