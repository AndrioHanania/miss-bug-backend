import { makeId, readJsonFile, writeJsonFile, bugFile } from "../../../services/util.service.js";
import { loggerService } from "../../../services/logger.service.js";

export const bugService = {
    query,
    getById,
    remove,
    save,
}

const FILE_PATH = bugFile
let bugs = readJsonFile(FILE_PATH)

async function query(filterBy) {
    try {
        let bugsToReturn = [...bugs]

        // Filtering
        const regex = new RegExp(filterBy.txt, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regex.test(bug.title) || regex.test(bug.description))

        if(filterBy.creatorId){
            bugsToReturn = bugsToReturn.filter(bug => bug.creator._id === filterBy.creatorId)
        }

        if(filterBy.severitySort)
            bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.severity)
        else
        bugsToReturn = bugsToReturn.filter(bug => bug.severity < filterBy.severity)

        bugsToReturn = bugsToReturn.filter(bug => filterBy.labels.every(label => bug.labels.includes(label)))

        // Sorting
        switch (filterBy.sortBy) {
            case 'createdAt':
                bugsToReturn = bugsToReturn.sort((b1, b2) => b1.createdAt - b2.createdAt)
                break;
            case 'severity':
                bugsToReturn = bugsToReturn.sort((b1, b2) => b1.severity - b2.severity)
                break;
            case 'title':
                bugsToReturn = bugsToReturn.sort((b1, b2) => b1.title.localeCompare(b2.title))
                break;
        }

        // Pagination
        const total = bugsToReturn.length;
        const pages = Math.ceil(total / filterBy.pageSize);
        const startIdx = (filterBy.page - 1) * filterBy.pageSize
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + filterBy.pageSize)

        return Promise.resolve({ bugs: bugsToReturn, total, pageSize: filterBy.pageSize, pages, page: filterBy.page })
    } catch (err) {
        loggerService.error(`Couldn't get bugs`)
        throw err
    }
}

async function getById(bugId) { 
    try {
        const bug = bugs.find(bug => bug._id === bugId)
        if (!bug) throw `Couldn't find bug with _id ${bugId}`
        return bug
    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`)
        throw err
    }
}

async function remove(bugId) {
    const { loggedinUser } = asyncLocalStorage.getStore()

    try {
        const bugToRemove = await getById(bugId)
        if (!loggedinUser.isAdmin && bugToRemove.creator._id !== loggedinUser._id) 
            throw 'Cant remove bug'

        const idx = bugs.findIndex(bug => bug._id === bugId)
        if (idx === -1) throw `Couldn't find bug with _id ${bugId}`
        bugs.splice(idx, 1)

        await writeJsonFile(FILE_PATH, bugs)
    } catch (err) {
        loggerService.error(`Couldn't remove bug : ${err}`)
        throw err
    }
}

async function save(bugToSave) { 
    const { loggedinUser } = asyncLocalStorage.getStore()

    try {        
        if (bugToSave._id) {
            if (!loggedinUser.isAdmin && bugToSave.creator._id !== loggedinUser._id) 
                throw 'Cant save bug'

            const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (idx === -1) 
                throw `Bad bug id ${bugToSave._id}`

            bugToSave.updatedAt = Date.now()
            bugs[idx] = { ...bugs[idx], ...bugToSave } // bugs.splice(idx, 1, bugToSave)
        } 
        else {
            bugs.push({
                ...bugToSave,
                _id: makeId(),
                creator: { _id: loggedinUser._id, fullname: loggedinUser.fullname },
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })
        }

        await writeJsonFile(FILE_PATH, bugs)
        return bugToSave
    } catch (err) {
        loggerService.error(`Couldn't save bug ${bugToSave._id}`)
        throw err
    }
}