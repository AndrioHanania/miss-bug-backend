import { loggerService } from "../../services/logger.service.js";
import { bugService } from "./service/index.js";

export const bugController = {
    getBugById,
    query,
    createBug,
    updateBug,
    deleteBug,
    downloadBugs
} 

async function getBugById (req, res) {
    const { bugId } = req.params

    try {
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

        loggerService.info(`User visited the following bugs: ${visitedBugs}`)

        const bug = await bugService.getById(bugId)
        res.json(bug)
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't get bug by id ${bugId}`)
    }
}

async function query (req, res) {
    try {
        const filterBy = {
			txt: req.query.txt,
			labels: req.query.labels,
			severitySort: req.query.severitySort,
			severity: req.query.severity,
			page: req.query.page,
			pageSize: req.query.pageSize,
			sortBy: req.query.sortBy,
			sortDir: req.query.sortDir,
            creatorId: req.query.creatorId
		}
        const data = await bugService.query(filterBy)

        res.json(data)
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't get bugs`)
    }
}

async function createBug(req, res) { 
    const bug = req.body;

    try {
        const savedBug = await bugService.save(bug);
        res.json(savedBug);
    } catch (err) {
        loggerService.error(err.message);
        res.status(400).send(`Couldn't create bug`);
    }
};

async function updateBug(req, res) {
    const bug = req.body;

    try {
        const updatedBug = await bugService.save(bug);
        res.json(updatedBug);
    } catch (err) {
        loggerService.error(err.message);
        res.status(400).send(`Couldn't update bug`);
    }
};

async function deleteBug(req, res) {
    const bugId = req.params.bugId

    try {
        await bugService.remove(bugId)
        res.send(bugId)
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
        res.json(bugsStr)
    } catch (err) {
        loggerService.error(err.message)
        res.status(400).send(`Couldn't download bugs`)
    }
}
