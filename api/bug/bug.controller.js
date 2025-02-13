import { loggerService } from "../../services/logger.service.js";
import { bugService } from "./bug.service.js";

export const bugController = {
    getBug,
    createBug,
    updateBug,
    deleteBug,
    downloadBugs
} 

async function getBug (req, res) {
    try {
        const { bugId } = req.query

        if (bugId) {
            let visitedBugs = []
            if (req.cookies.visitedBugs) {
                visitedBugs = JSON.parse(req.cookies.visitedBugs)
            }

            if (visitedBugs.length >= 3 && !visitedBugs.includes(bugId)) {
                return res.status(401).send('Wait for a bit')
            }

            if (!visitedBugs.includes(bugId)) {
                visitedBugs.push(bugId)
            }

            res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
                maxAge: 7000,
                httpOnly: true
            })

            console.log('User visited the following bugs:', visitedBugs)

            const bug = await bugService.getById(bugId)
            res.send(bug)
        } else {
            const filterBy = JSON.parse(req.query.filterBy)
            const bugs = await bugService.query(filterBy)
            res.send(bugs)
        }
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't get bug(s)`)
    }
}

async function createBug(req, res) { 
    const bugToSave = req.body;

    try {
        const savedBug = await bugService.save(bugToSave);
        res.send(savedBug);
    } catch (err) {
        loggerService.error(err.message);
        res.status(400).send(`Couldn't create bug`);
    }
};

async function updateBug(req, res) {
    const bugToUpdate = req.body;

    try {
        const updatedBug = await bugService.save(bugToUpdate);
        res.send(updatedBug);
    } catch (err) {
        loggerService.error(err.message);
        res.status(400).send(`Couldn't update bug`);
    }
};

async function deleteBug(req, res) {
    const { bugId } = req.query
    try {
        await bugService.remove(bugId)
        res.send('OK')
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't remove bug`)
    }
}

async function downloadBugs(req, res) {
    try {
        const bugs = await bugService.query()
        const bugsStr = JSON.stringify(bugs, null, 2)
        
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', 'attachment; filename=bugs.json')
        res.send(bugsStr)
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't download bugs`)
    }
}
