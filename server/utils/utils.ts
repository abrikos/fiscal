import {H3Event} from "h3";
import {PrismaClient} from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient()
export default {
    hashPassword(password: string) {
        return crypto.createHash('sha256',).update(password).digest('hex')
    },
    async setAuthToken(event: H3Event, user_id: number) {
        const {authExpiration, authTokenName} = useRuntimeConfig(event)
        const token = await prisma.token.create({data: {user_id, value:Math.random().toString()}})
        setCookie(event, authTokenName, token.value, {maxAge: authExpiration})
        return token
    },
    sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

}