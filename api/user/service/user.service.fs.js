import { readJsonFile, writeJsonFile, makeId, userFile } from '../../../services/util.service.js'

const FILE_PATH = userFile
let users = readJsonFile(FILE_PATH)

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername,
}

function query(filterBy) {
    let usersToReturn = [...users]

    // Filtering
    const regex = new RegExp(filterBy.txt, 'i')
    usersToReturn = usersToReturn.filter(user => regex.test(user.username) || regex.test(user.fullname))

    if(filterBy.scoreSort)
        usersToReturn = usersToReturn.filter(user => user.score >= filterBy.score)
    else
    usersToReturn = usersToReturn.filter(user => user.score < filterBy.score)

    // Sorting
    switch (filterBy.sortBy) {
        case 'createdAt':
            bugsToReturn = bugsToReturn.sort((b1, b2) => b1.createdAt - b2.createdAt)
            break;
        case 'score':
            bugsToReturn = bugsToReturn.sort((b1, b2) => b1.score - b2.score)
            break;
    }

    return Promise.resolve({ users: usersToReturn })
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    return user ? Promise.resolve(user) : Promise.reject('User not found!')
}

async function remove(userId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin } = loggedinUser

    if(!isAdmin && creatorId != userId)
        throw new Error('Not authorized to delete this user')

    users = users.filter(user => user._id !== userId)
    return await writeJsonFile(FILE_PATH, users)
}

async function save(user) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin } = loggedinUser

    try{
        if(!isAdmin && creatorId != userId)
            throw new Error('Not authorized to delete this user')
        
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

        const savedUser = await writeJsonFile(FILE_PATH, users)
            return savedUser
    }
    catch(err){
        loggerService.error(`couldn't save user: ${err}`)
        throw err
    }
}

async function getByUsername(username) {
    try {
        return users.find(user => user.username === username)
    } catch (err) {
        loggerService.error(`Couldn't get user by username : ${err}`)
        throw err
    }
}