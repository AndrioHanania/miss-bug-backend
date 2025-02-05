import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";
import { loggerService } from "./logger.service.js";

export const bugService = {
    query,
    getById,
    remove,
    save,
    getDefaultFilterBy
}

let bugs = readJsonFile('./data/bugs.json')

async function query(filterBy = getDefaultFilterBy()) {
    try {
        const regex = new RegExp(filterBy.txt, 'i')
        bugs = bugs.filter(bug => regex.test(bug.title))

        if(filterBy.severitySort)
            bugs = bugs.filter(bug => bug.severity >= filterBy.severity)
        else
            bugs = bugs.filter(bug => bug.severity < filterBy.severity)

        const startIdx = (filterBy.page - 1) * filterBy.pageSize
        bugs = bugs.slice(startIdx, startIdx + filterBy.pageSize)

        return Promise.resolve(bugs)
    } catch (err) {
        loggerService.error(`Couldn't get bugs`)
        throw err
    }
}

async function getById(bugId) { 
    try {
        const bug = bugs.find(bug => bug._id === bugId)
        if (!bug) throw `Bad bug id ${bugId}`
        return bug
    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`)
        throw err
    }
}

async function remove(bugId) { 
    try {
        const idx = bugs.findIndex(bug => bug._id === bugId)
        if (idx === -1) throw `Bad bug id ${bugId}`
        bugs.splice(idx, 1)
    
        await writeJsonFile('./data/bugs.json', bugs)
        return
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`)
        throw err
    }
}

async function save(bugToSave) { 
    try {
        if (bugToSave._id) {
            const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (idx === -1) throw `Bad bug id ${bugId}`
            bugToSave.updatedAt = Date.now()
            bugs.splice(idx, 1, bugToSave)
        } else {
            bugToSave._id = makeId()
            bugToSave.createdAt = Date.now()
            bugs.push(bugToSave)
        }
        await writeJsonFile('./data/bugs.json', bugs)
        return bugToSave
    } catch (err) {
        loggerService.error(`Couldn't save bug ${bugId}`)
        throw err
    }
}

function getDefaultFilterBy() {
    return { txt: '', severitySort: true, severity: 0, page: 1, pageSize: 5 }
}