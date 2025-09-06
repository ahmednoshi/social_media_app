import { HydratedDocument, model, models, Schema } from "mongoose";

export enum GenderEnum{
    male = "male",
    female = "female",
}

export enum RoleEnum{
    user = "user",
    admin = "admin",
}



export interface IUser {
    firstName:string;
    lastName:string;
    username?:string;

    email:string;
    confirmEmailOtp?:string;
    confirmAT?:string;

    password:string;
    confirmPassword?:string;
    resetPasswordOtp?:string;
    changeCredentialTime?:Date;

    phonne?:string;
    adress?:string;

    gender:GenderEnum;


    role:RoleEnum;
    age?:number;


    createdAt:Date;
    updatedAt?:Date;
    
}


export const userSchema = new Schema<IUser>(
    {
    firstName:{type:String,required:true,minlength:3,maxlength:30},
    lastName:{type:String,required:true},

    email:{type:String,required:true,unique:true},
    confirmEmailOtp:{type:String},
    confirmAT:{type:String},

    password:{type:String,required:true},
    confirmPassword:{type:String,required:true},
    resetPasswordOtp:{type:String},
    changeCredentialTime:{type:Date},

    phonne:{type:String},
    adress:{type:String},

    gender:{type:String,enum:GenderEnum,default:GenderEnum.male},


    role:{type:String,enum:RoleEnum,default:RoleEnum.user},
    age:{type:Number},


    createdAt:{type:Date},
    updatedAt:{type:Date},
    
   



},
{timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
}

);


userSchema.virtual("username").set(function (value:string){
    const [firstName , lastName] = value.split(" ") || [];
    this.set({firstName,lastName,})
}).get(function (){
    return this.firstName + " " + this.lastName
})


export const UserModel = models.User || model<IUser>("User",userSchema);

export type HUserDocument = HydratedDocument<IUser>;

