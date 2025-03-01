import { userService as fsService } from './user.service.fs.js'
import { userService as mongoService } from './user.service.mongo.js'

const service = mongoService
//const service = fsService
export const userService = { ...service }