import { loggerService } from "../../../services/logger.service.js";
import { dbService } from '../../../services/db.service.js'
import { asyncLocalStorage } from '../../../services/als.service.js'
import { ObjectId } from 'mongodb'
import { bugService } from "../../bug/service/index.js"

export const msgService = {
    query,
    getById,
    remove,
    save,
}

async function query(filterBy = {}) {
    try {
        const filter = {
			txt: filterBy.txt || '',
		}
        const criteria = _buildCriteria(filter)
		const collection = await dbService.getCollection('msg')
        return await collection.find(criteria).toArray()
	} catch (err) {
        loggerService.error(`Couldn't get msgs`)
		throw err
	}
}

async function getById(msgId) { 
    try {
        if (!ObjectId.isValid(msgId))
            throw new Error(`Invalid msg ID format: ${msgId}`);
        
        const criteria = { _id: ObjectId.createFromHexString(msgId) }
		const collection = await dbService.getCollection('msg')
		const msg = await collection.findOne(criteria)

        if (!msg) 
            throw new Error(`msg not found with ID: ${msgId}`);

		return msg
	} catch (err) {
        loggerService.error(`Couldn't get msg ${msgId}: ${err.message}`);
		throw err
	}
}

async function remove(msgId) {
    try {
        const criteria = { 
            _id: ObjectId.createFromHexString(msgId), 
        }        
		const collection = await dbService.getCollection('msg')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) 
            throw new Error('Not your msg')

		return msgId
    } catch (err) {
        loggerService.error(`Couldn't remove msg ${msgId}: ${err}`)
        throw err
    }
}

async function save(msg) { 
    let msgToSave = {
        txt: msg.txt || '',
        byUserId: msg.byUserId || '',
        aboutBugId: msg.aboutBugId || '',
    }
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin, fullname } = loggedinUser

    try {
        const collection = await dbService.getCollection('msg')

        if (msg._id) {
            const criteria = { 
                _id: ObjectId.createFromHexString(msg._id),
                ...(!isAdmin ? { byUserId: creatorId } : {})
            }
            const result = await collection.updateOne(criteria, { $set: msgToSave, $currentDate: { updatedAt: true } })

            if (result.matchedCount === 0)
                throw new Error(`Couldn't update msg ${msg._id} - not found or not authorized`)
        } 
        else {
            const result = await collection.insertOne({
                ...msgToSave,
                byUserId: creatorId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })

            msgToSave._id = result.insertedId
            msgToSave.byUser = loggedinUser
            msgToSave.aboutBug = await bugService.getById(msg.aboutBugId)
    
            delete msgToSave.aboutBug.givenMsgs
            delete msgToSave.aboutBugId
            delete msgToSave.byUserId
        }

        return msgToSave
    } catch (err) {
        loggerService.error(`Couldn't save msg ${msgToSave._id}: ${err}`)
        throw err
    }
}

function _buildCriteria(filterBy) {
    let criteria = {}

    if (filterBy.txt)
        criteria.txt = { $regex: filterBy.txt, $options: 'i' }

    if (filterBy.aboutBugId)
        criteria.aboutBugId = filterBy.aboutBugId;

    if (filterBy.aboutBugId)
        criteria.aboutBugId = filterBy.aboutBugId;

    return criteria
}