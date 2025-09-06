"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.userSchema = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minlength: 3, maxlength: 30 },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmAT: { type: String },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    resetPasswordOtp: { type: String },
    changeCredentialTime: { type: Date },
    phonne: { type: String },
    adress: { type: String },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    age: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, });
}).get(function () {
    return this.firstName + " " + this.lastName;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", exports.userSchema);
