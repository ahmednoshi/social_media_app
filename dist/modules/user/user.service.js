"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_repositry_1 = require("../../DB/repositry/database.repositry");
const user_model_1 = require("../../DB/models/user.model");
const app_Error_1 = require("../../utils/response/app.Error");
const hash_security_1 = require("./../../utils/security/hash.security");
const email_event_1 = __importDefault(require("../../utils/event/email.event"));
const otp_1 = require("../../utils/otp");
const token_security_1 = require("./../../utils/security/token.security");
class UserService {
    userModel = new database_repositry_1.DatabaseRepositry(user_model_1.UserModel);
    signUp = async (req, res) => {
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;
        const otp = (0, otp_1.generateOtp)();
        const [user] = await this.userModel.create({
            data: [{ firstName, lastName, email, role, confirmPassword, password: await (0, hash_security_1.generateHash)(password), confirmEmailOtp: await (0, hash_security_1.generateHash)(String(otp)) }],
            options: { validateBeforeSave: true },
        }) || [];
        if (!user) {
            throw new app_Error_1.AppError("fail to create user", 404);
        }
        email_event_1.default.emit("confirmEmail", { to: email, otp });
        return res.status(201).json({ message: "user created successfully", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmAT: { $exists: false },
            }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.confirmEmailOtp)) {
            throw new app_Error_1.AppError("invalid otp", 400);
        }
        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmAT: new Date(),
                $unset: { confirmEmailOtp: true }
            }
        });
        return res.status(200).json({ message: "email confirmed successfully" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email }
        });
        if (!user) {
            throw new app_Error_1.AppError("user not found", 404);
        }
        if (!user.confirmAT) {
            throw new app_Error_1.AppError("email not confirmed", 400);
        }
        if (!await (0, hash_security_1.compareHash)(password, user.password)) {
            throw new app_Error_1.AppError("invalid password", 400);
        }
        const Credentials = await (0, token_security_1.createCredentialToken)(user);
        return res.status(200).json({ message: "login successfully", data: { Credentials } });
    };
}
exports.default = new UserService;
