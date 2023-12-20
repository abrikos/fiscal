import {IToken, Token} from "~/server/models/token.model";

export default defineEventHandler(async (event) => {
    const {authExpiration, authTokenName, authRefreshBeforeExpiration} = useRuntimeConfig(event)
    const cookies = parseCookies(event)
    // @ts-ignore
    await Token.deleteExpiredTokens(authExpiration)
    const token: IToken | null = await Token.findOne({access: cookies[authTokenName]}).populate('user');
    console.log(event.method, event._path)
    if (token) {
        if(authExpiration - token?.secondsFromCreation < authRefreshBeforeExpiration){
            console.log('Token refresh', authExpiration , token?.secondsFromCreation)
            await utils.setAuthToken(event, token.user)
        }
        event.context.user = utils.adaptUser(token.user)
    }
})