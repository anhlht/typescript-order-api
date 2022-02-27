import chai = require('chai');
import chaiHttp = require('chai-http')
import 'mocha'
import app from '../../src/app'
import User from '../../src/models/user'
import { OrderModel } from '../../src/schemas/order'

chai.use(chaiHttp)

const expect = chai.expect

const user: User = {
    username: 'John',
    firstName: 'John',
    lastName: 'Doe',
    email: 'jhon@myemail.com',
    password: 'password',
    phone: '5555555',
    userStatus: 1,
}

let token: string


before(async () => {
    expect(OrderModel.modelName).to.be.equal('Order')
    // OrderModel.collection.drop()
})

describe('userRoute', () => {
    it('should create a new user and retrieve it back', async () => {
        return chai
            .request(app)
            .post('/users/')
            .send(user)
            .then(res => {
                expect(res.status).to.be.equal(201)
                expect(res.body.username).to.be.equal(user.username)
            })
    })
    it('should be able to login', async () => {
        return chai
            .request(app)
            .get(`/users/login?username=${user.username}&password=${user.password}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                token = res.body.token
            })
    })
    it('should respond with HTTP 404 status because there is no user', async () => {
        return chai
            .request(app)
            .get('/users/NO_USER')
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(404)
            })
    })
    it('should return the user created on the step before', async () => {
        return chai
            .request(app)
            .get(`/users/${user.username}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.username).to.be.equal(user.username)
            })
    })
    it('should updated the user John', async () => {
        const username = user.username
        user.username = 'Jhon Updated'
        user.firstName = 'Jhon Updated'
        user.lastName = 'Doe Updated'
        user.email = 'jhon@myemail_updated.com'
        user.password = 'password Updated'
        user.phone = '3333333'
        user.userStatus = 12
        return chai
            .request(app)
            .patch(`/users/${username}`)
            .set('Authorization', `Bearer ${token}`)
            .send(user)
            .then(res => {
                expect(res.status).to.be.equal(204)
            })
    })
    it('should return the user updated on the step before', async () => {
        return chai
            .request(app)
            .get(`/users/${user.username}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.username).to.be.equal(user.username)
                expect(res.body.firstName).to.be.equal(user.firstName)
                expect(res.body.lastName).to.be.equal(user.lastName)
                expect(res.body.email).to.be.equal(user.email)
                expect(res.body.password).to.be.equal(user.password)
                expect(res.body.phone).to.be.equal(user.phone)
                expect(res.body.userStatus).to.be.equal(user.userStatus)
            })
    })
    it('should return 404 because the user does not exist', async () => {
        user.firstName = 'Mary Jane'
        return chai
            .request(app)
            .patch(`/users/Mary`)
            .set('Authorization', `Bearer ${token}`)
            .send(user)
            .then(res => {
                expect(res.status).to.be.equal(500)
            })
    })
    it('should remove an existent user', async () => {
        return chai
            .request(app)
            .del(`/users/${user.username}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(204)
            })
    })
    it('should return 404 when it is trying to remove an user because the user does not exist', async () => {
        return chai
            .request(app)
            .del(`/users/Mary`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                expect(res.status).to.be.equal(500)
            })
    })
})
