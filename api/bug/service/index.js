import { bugService as fsService } from './bug.service.fs.js'
import { bugService as mongoService } from './bug.service.mongo.js'

const service = mongoService
//const service = fsService
export const bugService = { ...service }