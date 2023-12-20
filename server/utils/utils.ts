import {IUser} from "~/server/models/user.model";
import {H3Event} from "h3";
import {IToken, Token} from "~/server/models/token.model";

export default {
    adaptUser(user: IUser) {
        if (user) {
            user.passwordHash = ''
            user.restorePassword = ''
        }
        return user
    },
    async setAuthToken(event: H3Event, user: IUser) {
        const {authExpiration, authTokenName} = useRuntimeConfig(event)
        const token: IToken = await Token.create({user}) as unknown as IToken
        setCookie(event, authTokenName, token.access, {maxAge: authExpiration})
        return token
    },
    sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

}