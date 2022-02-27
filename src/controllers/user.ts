import { NextFunction, Request, Response } from 'express'
import { ApplicationType } from '../models/applicationType'
import { UserModel } from '../schemas/user'
import { formatOutput } from '../utility/orderApiUtility'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { OrderAPILogger } from '../utility/logger'

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username
    const password = req.query.password
    const user = await UserModel.findOne({ username: username })
    if (!user) {
        OrderAPILogger.logger.info(`[GET] [/users/login] nouser found with the username ${username}`)
        return next(new Error(`User's ${username} not found.`))
    }
    const validate = bcrypt.compareSync(password as string, user.password.valueOf())
    
    if (validate) {
        const body = { _id: user._id, email: user.email }
        const token = jwt.sign({ user: body }, 'top_secret')
        return formatOutput(res, { token: token }, 200, ApplicationType.JSON)
    } else {
        OrderAPILogger.logger.info(`[GET] [/users/login] user not authorized ${username}`)
        return next(new Error('Invalid username or password'))
    }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username
    OrderAPILogger.logger.info(`[GET] [/users] ${username}`)
    const result = await UserModel.findOne({ username: username })
    if (!result) {
        OrderAPILogger.logger.info(`[GET] [/users/:{username}] user with username ${username} not found`)
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    const user = result.toJSON()
    user!._id = user!._id.toString()
    return formatOutput(res, user, 200, ApplicationType.JSON)
}

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
    const newUser = new UserModel(req.body)
    
    OrderAPILogger.logger.info(`[POST] [/users] ${newUser}`)
    
    newUser.password = bcrypt.hashSync(newUser.password as string, 10)

    const result = await newUser.save()
    if (!result) {
        OrderAPILogger.logger.info(`[POST] [/users] something went wrong when saving a new user ${newUser.username}`)
        return next(new Error(`User's ${req.body.username} exists`))
    }
    const user = result.toJSON()
    user!._id = user!._id.toString()
    return formatOutput(res, user, 201, ApplicationType.JSON)
}

export let updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username
    OrderAPILogger.logger.info(`[PATCH] [/users] ${username}`)
    const user = await UserModel.findOne({ username: username })
    if (!user) {
        OrderAPILogger.logger.info(`[PATCH] [/users/:{username}] user with username ${username} not found`)
        return next(new Error(`User's ${username} not found.`))
    }
    user.username = req.body.username || user.username
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.email = req.body.email || user.email
    user.password = req.body.password || user.password
    user.phone = req.body.phone || user.phone
    user.userStatus = req.body.userStatus || user.userStatus

    const result = await user.save()
    if (!result) {
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    return formatOutput(res, result, 204, ApplicationType.JSON)
}

export let removeUser = async (req: Request, res: Response, next: NextFunction) => {
    const username = req.params.username
    OrderAPILogger.logger.warn(`[DELETE] [/users] ${username}`)
    const result = await UserModel.findOne({ username: username })
    if (!result) {
        OrderAPILogger.logger.info(`[DELETE] [/users/:{username}] user with username ${username} not found`)
        return next(new Error(`User's ${username} not found.`))
    }
    const tmp = await result.remove()
    if (!tmp) {
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    return formatOutput(res, {}, 204, ApplicationType.JSON)
}