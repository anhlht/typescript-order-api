import { Application } from 'express'
import * as apiController from '../controllers/api'

export class APIRoute {
    public routes(app: Application): void {
        app.route('/api').get(apiController.getApi)
    }
}