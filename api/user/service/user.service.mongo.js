import { loggerService } from "../../../services/logger.service.js";
import { dbService } from '../../../services/db.service.js'
import { asyncLocalStorage } from '../../../services/als.service.js'
import { ObjectId } from 'mongodb'
import { bugService } from "../../bug/service/index.js";
import { msgService } from "../../msg/service/index.js"

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername,
}

async function query(filterBy) {    
    try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)
        const collection = await dbService.getCollection('user')
        return await collection.find(criteria, { sort, projection: { password: 0 } }).toArray()
    } catch (err) {
        loggerService.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        if (!ObjectId.isValid(userId))
            throw new Error(`Invalid user ID format: ${userId}`);

        const userCriteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(userCriteria, { projection: { password: 0 } })
        
        if (!user) 
            throw new Error(`user not found with ID: ${userId}`);

        user.ownBugs = await bugService.query({ creatorId: userId })
        user.givenMsgs = await msgService.query({ byUserId: userId })

        return user
    } catch (err) {
        loggerService.error(`while finding user by id: ${userId}: ${err}`)
        throw err
    }
}

async function remove(userId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin } = loggedinUser

    try {
        if (userId !== creatorId && !isAdmin)
            throw new Error('Not authorized to delete this user')
        
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection('user')
        const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) 
            throw new Error('Not your user')

        return userId
    } catch (err) {
        loggerService.error(`cannot remove user ${userId}: ${err}`)
        throw err
    }
}

async function save(userToSave) {
    try{
        const collection = await dbService.getCollection('user')

        if(userToSave._id) {
            const { loggedinUser } = asyncLocalStorage.getStore()
            const { _id: creatorId, isAdmin } = loggedinUser

            if (userToSave._id !== creatorId && !isAdmin)
                throw new Error('Not authorized to update this user')

            const criteria = { _id: ObjectId.createFromHexString(userToSave._id) }
            delete userToSave.isAdmin
            const result = await collection.updateOne(criteria, { $set: userToSave, $currentDate: { updatedAt: true } })

            if (result.matchedCount === 0)
                throw new Error(`Couldn't update user ${userToSave._id} - not found or not authorized`)
        }
        else {
            const result = await collection.insertOne({
                ...userToSave,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
                score: 0,
                isAdmin: false
            })

            userToSave._id = result.insertedId
        }

        return userToSave
    }
    catch(err){
        loggerService.error(`couldn't save user: ${err}`)
        throw err
    }
}

async function getByUsername(username) {
    try {
		const collection = await dbService.getCollection('user')
		return await collection.findOne({ username }/*, { projection: { password: 0 } }*/) // login need password
	} catch (err) {
		logger.error(`couldn't find user by username '${username}': ${err}`)
		throw err
	}
}

function _buildCriteria(filterBy) {
    let criteria = {
        score: filterBy.scoreSort ? { $gte: filterBy.score } : { $lt: filterBy.score },
    }

    if (filterBy.txt) {
        criteria.$or = [
            { username: { $regex: filterBy.txt, $options: 'i' } },
            { fullname: { $regex: filterBy.txt, $options: 'i' } }
        ];
    }

    return criteria
}

function _buildSort(filterBy) {
    return !filterBy.sortBy ? {} : { [filterBy.sortBy]: filterBy.sortDir }
}