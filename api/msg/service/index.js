import { msgService as fsService } from './msg.service.fs.js'
import { msgService as mongoService } from './msg.service.mongo.js'

const service = mongoService
//const service = fsService
export const msgService = { ...service }