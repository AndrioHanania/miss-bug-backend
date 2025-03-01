import { loggerService } from "../../../services/logger.service.js";
import { dbService } from '../../../services/db.service.js'
import { asyncLocalStorage } from '../../../services/als.service.js'
import { ObjectId } from 'mongodb'
import { msgService } from "../../msg/service/index.js"

export const bugService = {
    query,
    getById,
    remove,
    save,
}

async function query(filterBy = {}) {
    try {
        const filter = {
			txt: filterBy.txt || '',
			labels: filterBy.labels || [],
			severitySort: filterBy.severitySort === 'true' || true,
			severity: +filterBy.severity || 0,
			page: +filterBy.page || 1,
			pageSize: +filterBy.pageSize || 5,
			sortBy: filterBy.sortBy || 'createdAt',
			sortDir: +filterBy.sortDir || -1,
            creatorId: filterBy.creatorId || ''
		}
        const criteria = _buildCriteria(filter)
        const sort = _buildSort(filter)
		const collection = await dbService.getCollection('bug')
		var bugCursor = await collection.find(criteria, { sort })
        const total = await collection.countDocuments(criteria);
        const pages = Math.ceil(total / filter.pageSize);
		bugCursor.skip((filter.page - 1) * filter.pageSize).limit(filter.pageSize)
		const bugs = await bugCursor.toArray()

		return { bugs, total, pages, page: filter.page, pageSize: filter.pageSize }
	} catch (err) {
        loggerService.error(`Couldn't get bugs`)
		throw err
	}
}

async function getById(bugId) { 
    try {
        if (!ObjectId.isValid(bugId))
            throw new Error(`Invalid bug ID format: ${bugId}`);
        
        const criteria = { _id: ObjectId.createFromHexString(bugId) }
		const collection = await dbService.getCollection('bug')
		const bug = await collection.findOne(criteria)

        if (!bug) 
            throw new Error(`Bug not found with ID: ${bugId}`);
        
        bug.givenMsgs = await msgService.query({ aboutBugId: bugId })

		return bug
	} catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}: ${err.message}`);
		throw err
	}
}

async function remove(bugId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin } = loggedinUser

    try {
        const criteria = { 
            _id: ObjectId.createFromHexString(bugId), 
            ...(!isAdmin ? { creator: { _id: creatorId } } : {})
        }        
		const collection = await dbService.getCollection('bug')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) 
            throw new Error('Not your bug')

		return bugId
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}: ${err}`)
        throw err
    }
}

async function save(bug) { 
    let bugToSave = {
        title: bug.title || '',
        severity: bug.severity || '',
        description: bug.description || '',
        labels: bug.labels || [],
        creator: bug.creator || {
            _id: '',
            fullname: '',
        },
    }
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: creatorId, isAdmin, fullname } = loggedinUser

    try {
        const collection = await dbService.getCollection('bug')

        if (bug._id) {
            const criteria = { 
                _id: ObjectId.createFromHexString(bug._id),
                ...(!isAdmin ? { 'creator._id': creatorId } : {})
            }
            const result = await collection.updateOne(criteria, { $set: bugToSave, $currentDate: { updatedAt: true } })

            if (result.matchedCount === 0)
                throw new Error(`Couldn't update bug ${bug._id} - not found or not authorized`)
        } 
        else {
            const result = await collection.insertOne({
                ...bugToSave,
                creator: { _id: creatorId, fullname },
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })

            bugToSave._id = result.insertedId
        }

        return bugToSave
    } catch (err) {
        loggerService.error(`Couldn't save bug ${bugToSave._id}: ${err}`)
        throw err
    }
}

function _buildCriteria(filterBy) {
    let criteria = {
        severity: filterBy.severitySort ? { $gte: filterBy.severity } : { $lt: filterBy.severity },
    }

    if (filterBy.txt) {
        criteria.$or = [
            { title: { $regex: filterBy.txt, $options: 'i' } },
            { description: { $regex: filterBy.txt, $options: 'i' } }
        ];
    }
    

    if (filterBy.labels?.length > 0)
        criteria.labels = { $all: filterBy.labels };

    if (filterBy.creatorId)
    criteria['creator._id'] = filterBy.creatorId;
    // criteria.creator = { _id: filterBy.creatorId } // This don't work!

    return criteria
}

function _buildSort(filterBy) {
    return !filterBy.sortBy ? {} : { [filterBy.sortBy]: filterBy.sortDir }
}