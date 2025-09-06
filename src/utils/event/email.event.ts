import { EventEmitter } from "node:stream";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "../email/send.email";
import { verifyEmailTemplate } from "../email/templete.email";


export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail",async(data:Mail.Options & {otp:string})=>{

    try {
        data.subject = "confirm your email";
        data.html = verifyEmailTemplate({title:"confirm your email",otp:data.otp});
        await sendEmail(data);
        
    } catch (error) {
        console.log("Failed to send email",error);
        
    }


})


export default emailEvent;