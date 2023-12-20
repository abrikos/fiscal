import {IToken, Token} from "~/server/models/token.model";
import {User} from "~/server/models/user.model";

export default defineEventHandler(async (event) => {
    const {authExpiration, authTokenName, authRefreshBeforeExpiration} = useRuntimeConfig(event)
    const cookies = parseCookies(event)
    console.log('xxxxxxxxxxxxxx')
    // @ts-ignore
    await Token.deleteExpiredTokens(authExpiration)
    User.findOne()
    console.log('zzzzzzzzzzzzzz')
    const token: IToken | null = await Token.findOne({access: cookies[authTokenName]}).populate('user');
    console.log('fftttttttt', token)
    console.log(event.method, event._path)
    if (token) {
        if(authExpiration - token?.secondsFromCreation < authRefreshBeforeExpiration){
            console.log('Token refresh', authExpiration , token?.secondsFromCreation)
            await utils.setAuthToken(event, token.user)
        }
        event.context.user = utils.adaptUser(token.user)
    }
})