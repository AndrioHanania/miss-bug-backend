import { makeId, readJsonFile, writeJsonFile } from "../../services/util.service.js";
import { loggerService } from "../../services/logger.service.js";

export const bugService = {
    query,
    getById,
    remove,
    save,
}

async function query(filterBy) {
    try {
        let bugs = readJsonFile('./data/bugs.json')

        // Filtering
        const regex = new RegExp(filterBy.txt, 'i')
        bugs = bugs.filter(bug => regex.test(bug.title) || regex.test(bug.description))

        if(filterBy.severitySort)
            bugs = bugs.filter(bug => bug.severity >= filterBy.severity)
        else
            bugs = bugs.filter(bug => bug.severity < filterBy.severity)

        bugs = bugs.filter(bug => filterBy.labels.every(label => bug.labels.includes(label)))

        // Sorting
        switch (filterBy.sortBy) {
            case 'createdAt':
                bugs = bugs.sort((b1, b2) => b1.createdAt - b2.createdAt)
                break;
            case 'severity':
                bugs = bugs.sort((b1, b2) => b1.severity - b2.severity)
                break;
            case 'title':
                bugs = bugs.sort((b1, b2) => b1.title.localeCompare(b2.title))
                break;
        }

        // Pagination
        const total = bugs.length;
        const pages = Math.ceil(total / filterBy.pageSize);
        const startIdx = (filterBy.page - 1) * filterBy.pageSize
        bugs = bugs.slice(startIdx, startIdx + filterBy.pageSize)

        return Promise.resolve({ bugs, total, pageSize: filterBy.pageSize, page: filterBy.page, pages })
    } catch (err) {
        loggerService.error(`Couldn't get bugs`)
        throw err
    }
}

async function getById(bugId) { 
    try {
        let bugs = readJsonFile('./data/bugs.json')
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
        let bugs = readJsonFile('./data/bugs.json')
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
        let bugs = readJsonFile('./data/bugs.json')

        if (bugToSave._id) {
            const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (idx === -1) throw `Bad bug id ${bugId}`
            bugToSave.updatedAt = Date.now()
            bugs.splice(idx, 1, bugToSave)
        } else {
            bugToSave._id = makeId()
            bugToSave.createdAt = bugToSave.updatedAt = Date.now()
            bugs.push(bugToSave)
        }
        await writeJsonFile('./data/bugs.json', bugs)
        return bugToSave
    } catch (err) {
        loggerService.error(`Couldn't save bug ${bugId}`)
        throw err
    }
}