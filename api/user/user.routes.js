import express from 'express'
import { getUser, getUsers, deleteUser, updateUser, CreateUser } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', updateUser)
router.post('/:id', CreateUser)
router.delete('/:id', deleteUser)

export const userRoute = router