import express from 'express'
import { getUser, getUsers, deleteUser, updateUser, CreateUser } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:userId', getUser)
router.put('/:userId', updateUser)
router.post('/:userId', CreateUser)
router.delete('/:userId', deleteUser)

export const userRoute = router