import { loggerService } from "../../services/logger.service.js";
import { msgService } from "./service/index.js";

export const msgController = {
    getMsgById,
    query,
    createMsg,
    updateMsg,
    deleteMsg,
} 

async function getMsgById (req, res) {
    const msgId = req.params.msgId

    try {
        const msg = await msgService.getById(msgId)
        res.send(msg)
    } catch (err) {
        loggerService.error('Failed to get msg', err)
        res.status(400).send({ err: 'Failed to get msg' })
    }
}

async function query (req, res) {
    try {
        const filterBy = {
            txt: req.query.txt,
            aboutBugId: req.aboutBugId,
            byUserId: req.byUserId,
        }
        const msgs = await msgService.query(filterBy)

        res.json(msgs)
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't get msgs`)
    }
}

async function createMsg(req, res) { 
    const msg = req.body;

    try {
        const savedMsg = await msgService.save(msg);
        res.json(savedMsg);
    } catch (err) {
        loggerService.error(err.message);
        res.status(400).send(`Couldn't create msg`);
    }
};

async function updateMsg(req, res) {
    const msg = req.body;

    try {
        const updatedMsg = await msgService.save(msg);
        res.json(updatedMsg);
    } catch (err) {
        loggerService.error(err.message);
        res.status(400).send(`Couldn't update msg`);
    }
};

async function deleteMsg(req, res) {
    const msgId = req.params.msgId

    try {
        await msgService.remove(msgId)
        res.send(msgId)
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't remove msg`)
    }
}