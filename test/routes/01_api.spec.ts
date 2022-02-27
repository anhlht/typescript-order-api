import chai = require('chai');
import chaiHttp = require('chai-http')
import 'mocha'
import app from '../../src/app'

chai.use(chaiHttp)

const expect = chai.expect

describe('Order API', () => {
    it('should respond with HTTP 200 status and Order API title', async () => {
        return chai
            .request(app)
            .get('/api')
            .then(res => {
                expect(res.status).to.be.equal(200)
                expect(res.body.title).to.be.equal('Order API')
            })
    })
})