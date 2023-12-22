import {PrismaClient} from '@prisma/client'


export default defineEventHandler(async (event) => {
    const prisma = new PrismaClient({log: []})

    const {authExpiration, authTokenName, authRefreshBeforeExpiration} = useRuntimeConfig(event)
    const cookies = parseCookies(event)
    if (!cookies[authTokenName]) return
    const token = await prisma.v_token_live.findFirst({
        where: {value: cookies[authTokenName]},
    })

    const user = await prisma.users.findUnique({
        where: {id: token?.user_id}, select: {
            id: true,
            email: true,
            name: true,
        }
    })
    /*
        const token = await prisma.token.findFirst({
            where: {value: cookies[authTokenName]},
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    }
                }
            }
        })
    */

    if (token && user) {
        if (authExpiration - token.live_seconds < authRefreshBeforeExpiration) {
            await utils.setAuthToken(event, user.id)
        }
        event.context.user = user
    }
})