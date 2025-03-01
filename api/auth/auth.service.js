import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/service/index.js'
import { loggerService } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET1)
const SALT_ROUNDS = 10


export const authService = {
    getLoginToken,
    validateToken,
    login,
    signup
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    try {
        const json = cryptr.decrypt(token)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        loggerService.info('Invalid login token')
    }
    return null
}

async function login(username, password) {
    const user = await userService.getByUsername(username)

    if (!user) 
        throw new Error('Unknown username')

    const match = await bcrypt.compare(password, user.password)

    if (!match) throw 'Invalid username or password'

    // Removing passwords and personal data
    return {
        _id: user._id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
        score: user.score,
        isAdmin: user.isAdmin,
    }
}

async function signup({ username, password, fullname }) {
    loggerService.debug(`Signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) throw 'Missing required signup information'

    const userExist = await userService.getByUsername(username)
    if (userExist) throw 'Username already taken'

    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return await userService.save({ username, password: hash, fullname })
}