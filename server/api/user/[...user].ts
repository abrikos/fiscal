import crypto from "crypto";
import nodemailer from 'nodemailer'
import {strategies} from "~/server/utils/strategies";
import {Prisma, PrismaClient} from '@prisma/client'

//User.deleteMany().then(console.log)
const router = createRouter()
const prisma = new PrismaClient({
    //log: ['query'],
    errorFormat: 'pretty',
})

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

router.post('/request-restore-password', defineEventHandler(async (event) => {
    const {email} = await readBody(event)
    const user = await prisma.users.findFirst({where: {email}})
    if (!user) {
        await utils.sleep(4000)
        return 1
    }
    user.restore_password = crypto.createHmac('sha256', '').update(Math.random().toString()).digest('hex')
    await prisma.users.update({where:{id:user.id}, data:user})
    const res = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Восстановление пароля',
        text: `Ссылка восстановления ${event.node.req.headers.origin}/password-restore-${user.restore_password}`
    })
    if (!res.messageId) throw createError({statusCode: 500, message: 'Ошибка отправки'})
    return 1
}))

router.post('/process-restore-password', defineEventHandler(async (event) => {
    const {code} = await readBody(event)
    const user = await prisma.users.findFirst({where: {restore_password: code}});
    if (!user) return
    const password = crypto.createHash('sha256').update(Math.random().toString()).digest('hex').substring(1, 5)
    user.password_hash = password
    user.restore_password = ''
    await prisma.users.update({where:{id:user.id}, data:user})
    if(user.email) {
        const res = transporter.sendMail({
            from: process.env.MAIL_USER,
            to: user.email,
            subject: 'Новый пароль',
            text: `Используйте этот пароль: ${password}`
        })
    }
    return 1
}))

router.get('/checkAuth', defineEventHandler(async (event) => {
    return event.context.user
}))

router.get('/logout', defineEventHandler(async (event) => {
    const cookies = parseCookies(event)
    const {authTokenName} = useRuntimeConfig(event)
    await prisma.token.deleteMany({where: {value: cookies[authTokenName]}});
    deleteCookie(event, authTokenName)
}))


router.put('/signup', defineEventHandler(async (event) => {
    try {
        const {email, password} = await readBody(event)
        const created = await prisma.users.create({data: {email, name: email, password_hash: utils.hashPassword(password)}})
        if (!created) throw createError({statusCode: 400, message: 'Юзер не создан'})
        const user = await prisma.users.findUnique({
            where: {id: created.id},
            select: {id: true, email: true, name: true, photo: true}
        });
        if (!user) throw createError({statusCode: 400, message: 'User not found'})
        await utils.setAuthToken(event, user?.id)
        return user
    } catch (e: any) {
        console.log(e.message)
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                throw createError({statusCode: 401, message: 'E-mail уже зарегистрирован'})
            }
        }
        throw createError({statusCode: 401, message: 'Ошибка регистрации'})
    }
}))

router.post('/login/:strategy', defineEventHandler(async (event) => {
    const {strategy} = event.context.params as Record<string, string>
    if (!strategies[strategy]) throw createError({statusCode: 406, message: `Ошибка в стратегии "${strategy}"`})
    const user = await strategies[strategy](event);
    if (!user) throw createError({statusCode: 401, message: 'login: Ошибка аутентификации',})
    await utils.setAuthToken(event, user.id)
    delete user.password_hash
    delete user.restore_password
    return user
}))

router.post('/update', defineEventHandler(async (event) => {
    const {name, password, avatarImage} = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    user.name = name
    user.avatarImage = avatarImage
    if (password) user.password = password
    await user.save()
}))

router.post('/password', defineEventHandler(async (event) => {
    const {password} = await readBody(event)
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    if (password) {
        user.password = password
        await user.save()
    }
}))

export default useBase('/api/user', router.handler)
