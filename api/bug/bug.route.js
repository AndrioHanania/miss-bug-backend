import express from 'express'
import { bugController } from './bug.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

export const bugRouter = express.Router()

bugRouter.get('/', bugController.query)
bugRouter.get('/download', bugController.downloadBugs);
bugRouter.get('/:bugId', bugController.getBugById)
bugRouter.post('/', requireAuth, bugController.createBug);
bugRouter.put('/', requireAuth, bugController.updateBug);
bugRouter.delete('/:bugId', requireAuth, bugController.deleteBug);