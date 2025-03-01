import express from 'express'
import { msgController } from './msg.controller.js'
import { requireAuth, requireAdmin } from '../../middlewares/require-auth.middleware.js'

export const msgRouter = express.Router()

msgRouter.get('/', msgController.query)
msgRouter.get('/:msgId', msgController.getMsgById)
msgRouter.post('/', requireAuth, msgController.createMsg);
msgRouter.put('/', requireAuth, msgController.updateMsg);
msgRouter.delete('/:msgId', requireAdmin, msgController.deleteMsg);