import { userService } from './service/index.js'
import { loggerService } from '../../services/logger.service.js'

export async function getUser(req, res) {
    const userId = req.params.userId

    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = req.query.filterBy
        const users = await userService.query(_typeFixFilterBy(filterBy))
        res.send(users)
    } catch (err) {
        loggerService.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.userId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        loggerService.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        loggerService.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function CreateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.save(user)
        res.send(savedUser)
    } catch (err) {
        loggerService.error('Failed to create user', err)
        res.status(400).send({ err: 'Failed to create user' })
    }
}

function _typeFixFilterBy(filterBy) {
    filterBy.sortDir = +filterBy.sortDir
    filterBy.score = +filterBy.score

    return filterBy
}