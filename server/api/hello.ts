export default defineEventHandler((event) => {
    //const DB: D1Database = event.context.cloudflare.env.DB;
    return {
        hello: 'world11111' + Math.random(),
    }
})