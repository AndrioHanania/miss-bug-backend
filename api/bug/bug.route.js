import express from 'express'
import { bugController } from './bug.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

export const bugRouter = express.Router()

bugRouter.get('/', bugController.getBug)
bugRouter.post('/', requireAuth, bugController.createBug);
bugRouter.put('/', requireAuth, bugController.updateBug);
bugRouter.delete('/', requireAuth, bugController.deleteBug);
bugRouter.get('/download', bugController.downloadBugs);
