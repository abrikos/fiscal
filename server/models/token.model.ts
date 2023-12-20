import {defineMongooseModel} from '#nuxt/mongoose'
import mongoose from 'mongoose';
import {IUser} from "~/server/models/user.model";
import moment from "moment";

export interface IToken extends mongoose.Document {
    access: string;
    resetCode: string;
    secondsFromCreation: number
    createdAt: number
    user: IUser
}

const tokenPrefix = 'auth'
const Schema = mongoose.Schema;

const schema = new Schema({
    access: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    resetCode: {type: String},
    createdAt: {type: Number, default: 0},
}, {
    toObject: {virtuals: true},
    // use if your results might be retrieved as JSON
    // see http://stackoverflow.com/q/13133911/488666
    toJSON: {virtuals: true}
})

schema.virtual('secondsFromCreation')
    .get(function () {
        const timestamp = moment().unix()
        return  timestamp - (this.createdAt || timestamp);
    })

schema.statics.deleteExpiredTokens = async function (maxAge) {
    await this.deleteMany({createdAt: {$lt: moment().unix() - maxAge}})
}

schema.pre('save', function (next) {
    // do stuff
    this.access = tokenPrefix + Math.random().toString()
    this.createdAt = moment().unix()
    next();
})

export const Token = defineMongooseModel('token', schema)