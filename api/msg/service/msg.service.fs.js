import { makeId, readJsonFile } from "../../../services/util.service.js";
import { loggerService } from "../../../services/logger.service.js";
import fs from 'fs'

export const msgService = {
    query,
    getById,
    remove,
    save,
}

const FILE_PATH = './data/msgs.json'
let msgs = readJsonFile(FILE_PATH)

async function query(filterBy) {
    try {
        let msgsToReturn = [...msgs]

        // Filtering
        const regex = new RegExp(filterBy.txt, 'i')
        msgsToReturn = msgsToReturn.filter(msg => regex.test(msg.txt))

        if(filterBy.byUserId)
            msgsToReturn = msgsToReturn.filter(msg => msg.byUserId === filterBy.byUserId)

        if(filterBy.aboutBugId)
            msgsToReturn = msgsToReturn.filter(msg => msg.aboutBugId === filterBy.aboutBugId)    

        return { msgs: msgsToReturn }
    } catch (err) {
        loggerService.error(`Couldn't get msgs`)
        throw err
    }
}

async function getById(msgId) { 
    try {
        const msg = msgs.find(msg => msg._id === msgId)
        if (!msg) throw `Couldn't find msg with _id ${msgId}`
        return msg
    } catch (err) {
        loggerService.error(`Couldn't get msg ${msgId}`)
        throw err
    }
}

async function remove(msgId) {

    try {
        const idx = msgs.findIndex(msg => msg._id === msgId)
        if (idx === -1) throw `Couldn't find msg with _id ${msgId}`
        msgs.splice(idx, 1)

        await _savemsgsToFile(FILE_PATH)
    } catch (err) {
        loggerService.error(`Couldn't remove msg : ${err}`)
        throw err
    }
}

async function save(msgToSave) { 
    const { loggedinUser } = asyncLocalStorage.getStore()

    try {        
        if (msgToSave._id) {
            if (msgToSave.byUserId !== loggedinUser._id) 
                throw 'Cant save car'

            const idx = msgs.findIndex(msg => msg._id === msgToSave._id)
            if (idx === -1) 
                throw `Bad msg id ${msgToSave._id}`

            msgToSave.updatedAt = Date.now()
            msgs[idx] = { ...msgs[idx], ...msgToSave } // msgs.splice(idx, 1, msgToSave)
        } 
        else {
            msgs.push({
                ...msgToSave,
                _id: makeId(),
                byUserId: loggedinUser._id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })
        }

        await _savemsgsToFile(FILE_PATH)
        return msgToSave
    } catch (err) {
        loggerService.error(`Couldn't save msg ${msgToSave._id}`)
        throw err
    }
}