import * as bodyParser from 'body-parser'
import express = require('express');
import mongoose = require("mongoose")
import { APIRoute } from './routes/api'
import { OrderRoute } from './routes/order'
import { UserRoute } from './routes/user'
import * as errorHandler from './utility/errorHandler'
import * as expressWinston from 'express-winston'
import * as winston from 'winston'
import * as dotenv from 'dotenv'

class App {
    public app: express.Application
    public userRoutes: UserRoute = new UserRoute()
    public apiRoutes: APIRoute = new APIRoute()
    public orderRoutes: OrderRoute = new OrderRoute()
    public mongoUrl: string
    public mongoUser: string
    public mongoPass: string

    constructor() {
        const path = `${__dirname}/../.env.${process.env.NODE_ENV}`
        dotenv.config({ path: path })
        this.mongoUrl = `mongodb://${process.env.MONGODB_URL_PORT}/${process.env.MONGODB_DATABASE}`
        this.mongoUser = `${process.env.MONGODB_USER}`
        this.mongoPass = `${process.env.MONGODB_PASS}`

        this.app = express()
        this.app.use(bodyParser.json())
        this.userRoutes.routes(this.app)
        this.apiRoutes.routes(this.app)
        this.orderRoutes.routes(this.app)
        this.mongoSetup()
        this.app.use(
            expressWinston.errorLogger({
                transports: [new winston.transports.Console()],
            })
        )
        this.app.use(errorHandler.clientErrorHandler)
        this.app.use(errorHandler.errorHandler)
    }

    private mongoSetup(): void {
        if (process.env.NODE_ENV === 'prod') {
            mongoose.connect(this.mongoUrl, {
                user: this.mongoUser,
                pass: this.mongoPass
            })
        } else if(process.env.NODE_ENV === 'test-ci') {
            mongoose.connect('mongodb+srv://anhlht:WYTvYnXdC6OfkqQ+@cluster0.ykidk.mongodb.net/order-api-test?retryWrites=true&w=majority')
        } else {
            mongoose.connect(this.mongoUrl)
        }
    }
}

export default new App().app