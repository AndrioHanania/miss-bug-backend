import express from 'express'
import { bugController } from './bug.controller.js'

export const bugRouter = express.Router()

bugRouter.get('/', bugController.getBug)
bugRouter.post('/', bugController.createBug);
bugRouter.put('/', bugController.updateBug);
bugRouter.delete('/', bugController.deleteBug);
bugRouter.get('/download', bugController.downloadBugs);
