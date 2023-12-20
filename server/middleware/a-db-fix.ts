import {User, Token} from "#imports";
export default defineEventHandler(async () => {
    // Need to add execution for all models
    User.findOne()
    Token.findOne()
})