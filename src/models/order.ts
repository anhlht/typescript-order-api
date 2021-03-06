import { OrderStatus } from './orderStatus'

export default interface Order {
    userId: String
    quantity: Number
    shipDate: Date
    status: OrderStatus
    complete: Boolean
}