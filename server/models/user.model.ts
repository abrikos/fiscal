import crypto from "crypto";
import {defineMongooseModel} from '#nuxt/mongoose'
import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    name: string;
    avatarImage: string;
    passwordHash: string;
    password: string;
    restorePassword: string
    email: string;
    strategy: string;
    checkPasswd: (passwd: string) => boolean
    _doc:any
}


const Schema = mongoose.Schema;
const validateEmail = function (email: string) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

function md5(str: string) {
    return crypto.createHmac('sha256','').update(str).digest('hex')
}


const schema = new Schema({
    nameStored: String,
    avatarImage: String,
    strategy: String,
    passwordHash:  String,
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        required: true,
    },
    restorePassword: String,
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})

schema.methods.checkPasswd = function (passwd: string) {
    return md5(passwd) === this.passwordHash;
}

schema.virtual('name')
    .get(function () {
        return this.nameStored || this.email;
    })
    .set(function (value) {
        this.nameStored = value
    })
schema.virtual('password')
    .get(function () {
        return '';
    })
    .set(function (value) {
        this.passwordHash = md5(value)
    })

schema.virtual('tokens', {
    ref: 'token',
    localField: '_id',
    foreignField: 'user'
})

export const User = defineMongooseModel('user', schema)