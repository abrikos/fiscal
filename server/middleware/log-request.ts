
export default defineEventHandler(async (event) => {
    console.log(event.method, event._path)
})