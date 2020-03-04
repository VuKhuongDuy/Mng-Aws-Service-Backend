let chai = require("chai");
let chaiHttp = require("chai-http");
let app = require("../app.js");
var { user_model } = require("../model/model");
let tokenAuth = require('./tokenAuth')

chai.use(chaiHttp);

function test_mng_account(){
    beforeEach(done => {
        // accountAWS_model.remove({}, (err)=>{
            done()
        // })
    })

    describe("/Add account", () => {
        it("Empty info", done => {
            let data = {
                accessKeyId : "AKIA5QS3A2GU754PXBWE",
                secretAccessKey: "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",
                region: "us-west-2",
                email: "vukhuongduy23@gmail.com"
            }

            chai
            .request(app)
            .post('/api/accountaws/add')
            .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
            .send(data)
            .end((err, res) => {
                res.body.should.have.property('success').eql(false)
                res.body.should.have.property('message').eql(__('INFO_EMPTY'))
                done()
            })
        })

        it("It should add an account", async done => {
            const user = await user_model.find({})
            let data = {
                name: "account1",
                accessKeyId : "AKIA5QS3A2GU754PXBWE",
                secretAccessKey: "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",
                region: "us-west-2",
                email: "vukhuongduy23@gmail.com",
                user: user[0]
            }
            
            chai
            .request(app)
            .post('/api/accountaws/add')
            .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
            .send(data)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('success').eql(true)
                res.body.should.have.property('data')
                res.body.data.should.have.property('name')
                res.body.data.should.have.property('region')
                done()
            })
        })

        it("It shouldn't access an account", async done => {
            const user = await user_model.find({})
            let data = {
                name: "vm_test",
                accessKeyId : "aBDQW",
                secretAccessKey: "abvmKOiJ2Z8LfwUot9sNLQfnMxjI8Gkf7AHuIBdI",
                region: "us-west-2",
                email: "vukhuongduy23@gmail.com",
                user: user[0]
            }

            chai
            .request(app)
            .post('/api/accountaws/add')
            .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
            .send(data)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('success').eql(false)
                res.body.should.have.property('message').eql(__('INFO_ACCOUNT_WRONG'))
                done()
            })
        })
    })

    describe("/List account", () => {
        it("It should response list account", done => {
            chai
            .request(app)
            .get('/api/accountaws')
            .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
            .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('success').eql(true)
                res.body.should.have.property('data').which.is.an('array')
                res.body.data[0].should.have.property('name')
                res.body.data[0].should.have.property('region')
                done()
            })
        })
    })
}

module.exports = test_mng_account