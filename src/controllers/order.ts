import { NextFunction, Request, Response } from 'express'
import * as _ from 'lodash'
import { ApplicationType } from '../models/applicationType' 
import { formatOutput } from '../utility/orderApiUtility'
import { OrderModel } from '../schemas/order'
import { UserModel } from '../schemas/user'
import { ObjectId } from 'mongodb'
import { OrderAPILogger } from '../utility/logger'

export let getOrder = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    OrderAPILogger.logger.info(`[GET] [/store/orders/] ${id}`)
    if (!ObjectId.isValid(id)) {
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    const result = await OrderModel.findById(new ObjectId(id as string))
    if (!result) {
        OrderAPILogger.logger.info(`[GET] [/store/orders/:{orderId}] Order ${id} not found.`)
        return next(new Error(`Order ${id} not found.`))
    }
    const order = result.toJSON()
    order._id = order._id.toString()
    return formatOutput(res, order, 200, ApplicationType.JSON)
}

export let getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit as string || 10
    const offset = req.query.offset as string || 0
    OrderAPILogger.logger.info(`[GET] [/store/orders/]`)
    const orders = await OrderModel.find({}, null, { skip: offset as number, limit: limit as number})
    if (!orders) {
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    const filteredOrders = _.take(_.drop(orders, offset as number), limit as number)
    return formatOutput(res, filteredOrders, 200, ApplicationType.JSON)
}

export let addOrder = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId
    const result =  await UserModel.findById(userId)
    OrderAPILogger.logger.info(`[POST] [/store/orders/] ${userId}`)
    if (!result) {
        OrderAPILogger.logger.info(`[POST] [/store/orders/] There is no user with the userId ${userId}`)
        throw new Error(`There is no user with the userId ${userId}`)
    }
    const newOrder = new OrderModel(req.body)
    OrderAPILogger.logger.info(`[POST] [/store/orders/] ${newOrder}`)
    const order = await newOrder.save()
    
    return formatOutput(res, order, 201, ApplicationType.JSON)
}

export let removeOrder = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    OrderAPILogger.logger.warn(`[DELETE] [/store/orders/] ${id}`)
    if (!ObjectId.isValid(id)) {
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    const order = await OrderModel.findById(new ObjectId(id))
    if (!order) {
        OrderAPILogger.logger.warn(`[DELETE] [/store/orders/:{orderId}] Order id ${id} not found`)
        return next(new Error(`Order ${id} not found.`))
    }
    await order.remove()
    return formatOutput(res, {}, 204, ApplicationType.JSON)
}

export let getInventory = async (req: Request, res: Response, next: NextFunction) => {
    const status = req.query.status
    OrderAPILogger.logger.info(`[GET] [/store/inventory/] ${status}`)
    const orders = await OrderModel.find({status: status as string})
    if (!orders) {
        return formatOutput(res, {}, 404, ApplicationType.JSON)
    }
    const grouppedOrders = _.groupBy(orders, 'userId')
    return formatOutput(res, grouppedOrders, 200, ApplicationType.JSON)
}