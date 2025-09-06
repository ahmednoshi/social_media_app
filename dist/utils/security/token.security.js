"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.createCredentialToken = exports.getSignature = exports.detectSingnatureLevel = exports.verifyToken = exports.generateToken = exports.tokenTypeEnum = exports.signatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/models/user.model");
const app_Error_1 = require("../response/app.Error");
const user_model_2 = require("./../../DB/models/user.model");
const database_repositry_1 = require("../../DB/repositry/database.repositry");
var signatureLevelEnum;
(function (signatureLevelEnum) {
    signatureLevelEnum["Bearer"] = "Bearer";
    signatureLevelEnum["admin"] = "admin";
})(signatureLevelEnum || (exports.signatureLevelEnum = signatureLevelEnum = {}));
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum["access"] = "access";
    tokenTypeEnum["refresh"] = "refresh";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
const generateToken = async ({ payload, secretKey = process.env.SECRET_KEY, options = { expiresIn: Number(process.env.TOKEN_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secretKey, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secretKey = process.env.SECRET_KEY, }) => {
    return (0, jsonwebtoken_1.verify)(token, secretKey);
};
exports.verifyToken = verifyToken;
const detectSingnatureLevel = async (role = user_model_1.RoleEnum.user) => {
    let signatureLevel = signatureLevelEnum.Bearer;
    switch (role) {
        case user_model_1.RoleEnum.admin:
            signatureLevel = signatureLevelEnum.admin;
            break;
        default:
            signatureLevel = signatureLevelEnum.Bearer;
            break;
    }
    return signatureLevel;
};
exports.detectSingnatureLevel = detectSingnatureLevel;
const getSignature = async (SingnatureLevel = signatureLevelEnum.Bearer) => {
    let segnatures = { access_token: "", refresh_token: "" };
    switch (SingnatureLevel) {
        case signatureLevelEnum.admin:
            segnatures.access_token = process.env.SECRET_KEY_ADMIN;
            segnatures.refresh_token = process.env.SECRET_KEY_REFRESH_ADMIN;
            break;
        default:
            segnatures.access_token = process.env.SECRET_KEY;
            segnatures.refresh_token = process.env.SECRET_KEY_REFRESH;
            break;
    }
    return segnatures;
};
exports.getSignature = getSignature;
const createCredentialToken = async (user) => {
    const signatureLevel = await (0, exports.detectSingnatureLevel)(user.role);
    const signature = await (0, exports.getSignature)(signatureLevel);
    console.log({ signature });
    const accessToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secretKey: signature.access_token,
        options: { expiresIn: Number(process.env.TOKEN_EXPIRES_IN) }
    });
    const refreshToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secretKey: signature.refresh_token,
        options: { expiresIn: Number(process.env.TOKEN_EXPIRES_IN_REFRESH) }
    });
    return { accessToken, refreshToken };
};
exports.createCredentialToken = createCredentialToken;
const decodeToken = async ({ authorization, tokenType = tokenTypeEnum.access }) => {
    const userModel = new database_repositry_1.DatabaseRepositry(user_model_2.UserModel);
    const [bearerKey, token] = authorization.split(" ");
    if (!token || !bearerKey) {
        throw new app_Error_1.AppError("token is required", 400);
    }
    const signatures = await (0, exports.getSignature)(bearerKey);
    const decoded = await (0, exports.verifyToken)({
        token,
        secretKey: tokenType === tokenTypeEnum.refresh ? signatures.refresh_token : signatures.access_token
    });
    if (!decoded._id || !decoded.iat) {
        throw new app_Error_1.AppError("invalid token", 400);
    }
    const user = await userModel.findOne({
        filter: { _id: decoded._id }
    });
    if (!user) {
        throw new app_Error_1.AppError("user not found", 404);
    }
    return { user, decoded };
};
exports.decodeToken = decodeToken;
