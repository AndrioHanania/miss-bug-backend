import fs from 'fs'
import { readJsonFile, makeId } from '../../services/util.service.js'


let users = readJsonFile('data/users.json')

export const userService = {
    query,
    getById,
    remove,
    save,
}

function query() {
    return Promise.resolve(users)
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('User not found!')
    return Promise.resolve(user)
}

function remove(userId) {
    users = users.filter(user => user._id !== userId)
    return _saveUsersToFile()
}

function save(user) {
    user._id = makeId()
    // TODO: severe security issue- attacker can post admins
    users.push(user)
    return _saveUsersToFile().then(() => user)

}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {

        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', usersStr, (err) => {
            if (err) {
                return console.log(err);
            }
            resolve()
        })
    })
}