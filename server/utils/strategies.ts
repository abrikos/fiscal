import {BinaryLike} from "node:crypto";
import crypto from "crypto";
import {EventHandlerRequest, H3Event} from "h3";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

interface IStrategies {
    [key: string]: Function
}

export const strategies:IStrategies = {
    async password(event: H3Event) {
        const {email, password} = await readBody(event)
        const user = await prisma.users.findFirst({where:{email}});
        if(!user) return
        if (user.password_hash === utils.hashPassword(password)) {
            return user
        }
    },
    async telegram(event: H3Event) {
        const body = await readBody(event)
        const {username, first_name, last_name, photo_url} = body
        const email = username + '@telegram.org'

        function checkSignature(body: any) {
            const {hash, ...data} = body
            const TOKEN: BinaryLike = process.env.BOT_TOKEN as BinaryLike;
            const secret = crypto.createHash('sha256')
                .update(TOKEN)
                .digest();
            const {returnUrl, strategy, ...rest} = data;
            const checkString = Object.keys(rest)
                .sort()
                .map(k => (`${k}=${data[k]}`))
                .join('\n');
            const hmac = crypto.createHmac('sha256', secret)
                .update(checkString)
                .digest('hex');
            return hmac === hash
        }

        if (checkSignature(body)) {
            let user = await prisma.users.findFirst({where:{email, strategy: 'telegram'}})
            if (!user) {
                user = await prisma.users.create({data:{
                    strategy: 'telegram',
                    name: first_name + ' ' + last_name,
                    photo: photo_url,
                    email,
                }})
            }
            return user
        }
    }
}