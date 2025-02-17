import fs from 'fs'
import { readJsonFile, makeId } from '../../services/util.service.js'


let users = readJsonFile('data/users.json')

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername,
}

function query() {
    return Promise.resolve(users)
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    return user ? Promise.resolve(user) : Promise.reject('User not found!')
}

async function remove(userId) {
    users = users.filter(user => user._id !== userId)
    return await _saveUsersToFile()
}

async function save(user) {
    try{
        if(user._id) {
            const userIdx = users.findIndex(currUser => currUser._id === user._id)
            if (userIdx < 0) 
                throw new Error(`Update failed, cannot find user with id: ${user._id}`)

            const isAdmin = users[userIdx].isAdmin
            user.isAdmin = isAdmin

            user.updatedAt = Date.now()
            users[userIdx] = {...users[userIdx], ...user}
        }
        else {
            user._id = makeId()
            user.createdAt = user.updatedAt = Date.now()
            if (!user.imgUrl) user.imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
            user.isAdmin = false
            users.push(user)
        }

        const savedUser = await _saveUsersToFile()
            return savedUser
    }
    catch(err){
        loggerService.error(`couldn't save user: ${err}`)
        throw err
    }
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {

        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/users.json', usersStr, (err) => {
            if (err)
                return console.log(err);

            resolve()
        })
    })
}

async function getByUsername(username) {
    try {
        return users.find(user => user.username === username)
    } catch (err) {
        loggerService.error(`Couldn't get user by username : ${err}`)
        throw err
    }
}