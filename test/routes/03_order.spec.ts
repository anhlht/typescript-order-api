import chai = require('chai');
import chaiHttp = require('chai-http')
import 'mocha'
import app from '../../src/app'
import Order from '../../src/models/order'
import { OrderStatus } from '../../src/models/orderStatus'

chai.use(chaiHttp)

const expect = chai.expect

const order: Order = {
    userId: "",
    quantity: 1,
    shipDate: new Date(),
    status: OrderStatus.Placed,
    complete: false,
}

let orderIdCreated:string
let token:string

describe('orderRoute', () => {
    it('should create a new user for Order tests and retrieve it back', async () => {
        const user = {
            username: 'OrderUser',
            firstName: 'Order',
            lastName: 'User',
            email: 'order@myemail.com',
            password: 'password',
            phone: '5555555',
            userStatus: 1,
        }
        return chai
            .request(app)
            .post('/users')
            .send(user)
            .then(res => {
                expect(res.status).to.be.equal(201)
                expect(res.body.username).to.be.equal(user.username)
                order.userId = res.body._id
            })
    })
    it('should be able to login and get the token to be used on orders requests', async () => {
       return chai
         .request(app)
         .get('/users/login?username=OrderUser&password=password')
         .then(res => {
           expect(res.status).to.be.equal(200)
           token = res.body.token
         })
    })
    it('should respond with HTTP 404 status because there is no order', async () => {
        return chai
            .request(app)
            .get(`/store/orders/000`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(404)
            })
    })
    it('should create a new order and retrieve it back', async () => {
        return chai
            .request(app)
            .post('/store/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(order)
            .then(res => {
                expect(res.status).to.be.equal(201)
                expect(res.body.userId).to.be.equal(order.userId)
                expect(res.body.complete).to.be.equal(false)
                orderIdCreated = res.body._id
            })
    })
    it('should return the order created on the step before', async () => {
        return chai
            .request(app)
            .get(`/store/orders/${orderIdCreated}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body._id).to.be.equal(orderIdCreated)
                expect(res.body.status).to.be.equal(order.status)
            })
    })
    it('should return all orders so far', async () => {
        return chai
            .request(app)
            .get(`/store/orders`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.length).to.be.equal(1)
            })
    })
    it('should return the inventory for all users', async () => {
        return chai
            .request(app)
            .get(`/store/inventory?status=PLACED`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body[`${order.userId}`].length).to.be.equal(1)
            })
    })
    it('should remove an existing order', async () => {
        return chai
            .request(app)
            .del(`/store/orders/${orderIdCreated}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(204)
            })
    })
    it('should return 404 when it is trying to remove an order because the order does not exist', async () => {
        return chai
            .request(app)
            .del(`/store/orders/${orderIdCreated}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(500)
            })
    })
    it('should not return orders because offset is higher than the size of the orders array', async () => {
        return chai
            .request(app)
            .get(`/store/orders?offset=2&limit=2`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.length).to.be.equal(0)
            })
    })
})