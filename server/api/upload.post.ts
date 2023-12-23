import {Prisma, PrismaClient} from "@prisma/client";
import fiscalCreateInput = Prisma.fiscalCreateInput;
import goodUncheckedCreateInput = Prisma.goodUncheckedCreateInput;

const prisma = new PrismaClient()

function camelToSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

interface ICheck {
    [key: string]: any
}

function objConvertToSnake(obj: ICheck) {
    const snake: ICheck = {}
    for (const key in obj) {
        snake[camelToSnakeCase(key)] = obj[key]
    }
    return snake
}

function stripPrisma<T extends {}>(input: { fields: {} }, data: T): T {
    let validKeys = Object.keys(input.fields);
    let dataCopy: any = {...data};
    for (let key of Object.keys(data)) {
        if (!(validKeys.includes(key))) {
            delete dataCopy[key];
        }
    }
    return dataCopy as T;
}

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({statusCode: 403, message: 'Доступ запрещён',})
    let formData = await readMultipartFormData(event)
    //prisma.$queryRaw`SET client_encoding = 'UTF8';`.then(console.log)
    if (formData) {
        //try {
        const json = JSON.parse(formData[0].data.toString())
        //console.log(objConvertToSnake(json[0].ticket.document.receipt))
        //return
        for (const checkImported of json) {
            const checkData = objConvertToSnake(checkImported.ticket.document.receipt);
            checkData.owner = checkData.user;
            checkData.user_id = user.id;
            checkData.date_time = (new Date(checkData.date_time)).toISOString();
            const found = await prisma.fiscal.findUnique({
                where: {fiscal_document_number: checkData.fiscal_document_number}
            })
            if (found) continue
            //return console.log(checkData)
            try {
                const check = await prisma.fiscal.upsert({
                        where: {fiscal_document_number: checkData.fiscal_document_number, user_id: user.id},
                        create: stripPrisma(prisma.fiscal, checkData) as fiscalCreateInput,
                        update: {}
                    },
                )
                //.catch(e=>console.log(checkData, e.message));
                if (check.id) {
                    for (const item of checkData.items as unknown as [{ fiscal_id: number }]) {
                        item.fiscal_id = check.id;
                        await prisma.good.create({
                            data: stripPrisma(prisma.good, item) as goodUncheckedCreateInput,
                        })
                        //.catch(e => {                                    console.log(e.message, item,)
                        // })
                    }
                }
            } catch (e: any) {
                console.log(e.message)
                throw createError({statusCode: 406, message: e.message})
            }
        }
        // } catch (e: any) {
        //
        //     throw createError({statusCode: 406, message: e.message})
        // }
    }
})