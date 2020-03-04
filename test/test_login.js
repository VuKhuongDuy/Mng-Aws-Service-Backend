process.env.NODE_ENV = "test";

let { user_model } = require("../model/model.js");
let chai = require("chai");
let chaiHttp = require("chai-http");
let app = require("../app.js");
const expect = chai.expect;
let should = chai.should();
let tokenAuth = require('./tokenAuth')

let status = require('../statusCode')

chai.use(chaiHttp);

function test_login() {
  beforeEach(done => {
    // user_model.remove({}, (err)=>{
    done();
    // })
  });

  describe("/Send email and save user", () => {
    
    it("Email empty", done => {
      let user = {
        username: "vuduy",
        password: "vuduy",
      };

      chai
        .request(app)
        .post("/api/logup/email")
        .set("Lang", "vi")
        .send(user)
        .end((err, res) => {
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property('message').eql(__('INFO_EMPTY'))
          done();
        });
    });

    it("It should send successfully a code to an email", done => {
      console.log(tokenAuth.EMAIL_TEST)
      let user = {
        username: "vuduy",
        password: "vuduy",
        email: tokenAuth.EMAIL_TEST
      };

      chai
        .request(app)
        .post("/api/logup/email")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });

    it("it should create an user", async done => {
      let user = await user_model.findOne(
        { email: tokenAuth.EMAIL_TEST },
        { code: 1 }
      );

      let email = {
        email: tokenAuth.EMAIL_TEST,
        code: user.code
      };

      chai
        .request(app)
        .post("/api/logup")
        .send(email)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });

    it("Email should already exist in user", done => {
      let user = {
        username: "vuduy",
        password: "vuduy",
        email: tokenAuth.EMAIL_TEST
      };

      chai
        .request(app)
        .post("/api/logup/email")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("active").eql(true);
          res.body.should.have.property("message").eql(__('EMAIL_EXIST'))
          done();
        });
    });

    it("Email should already exist in user but nothing active", async function(done) {
      let user = new user_model({
        username: "vuduy",
        password: "vuduy",
        email: tokenAuth.EMAIL_TEST2,
        active: false,
        code: "111111"
      });

      await user.save();
      chai
        .request(app)
        .post("/api/logup/email")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("active").eql(false);
          res.body.should.have.property("message").eql( __('EMAIL_NO_VERIFY'))
          done();
        });
    });

    it("Code should wrong", async done => {
      let code = await user_model.findOne(
        { email: tokenAuth.EMAIL_TEST2 },
        { code: 1 }
      );
      let email = {
        email: tokenAuth.EMAIL_TEST2,
        code: code.code + 12
      };

      chai
        .request(app)
        .post("/api/logup")
        .send(email)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message").eql(__('CODE_WRONG'))
          done();
        });
    });
  });

  describe("/Create user", ()=>{
    it("Empty email, empty code", ()=>{
      let user = []
      chai
        .request(app)
        .post("/api/logup")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message").eql(__('INFO_EMPTY'))
          done();
        });
    })
  })

  describe("/Check login", () => {
    it("Empty username, empty password", ()=>{
      let user = []
      chai
        .request(app)
        .post("/api/logup")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property('message').eql(__('INFO_EMPTY'))
          done();
        });
    })

    it("it should login successfully", done => {
      let user = {
        username: "vuduy",
        password: "vuduy"
      };

      chai
        .request(app)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(true);
          res.body.should.have.property('token')
          console.log(res.body.token)
          tokenAuth.setTokenAuth(res.body.token)
          done();
        });
    });

    it("it should login false", done => {
      let user = {
        username: "vuduy",
        password: "vudu"
      };

      chai
        .request(app)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message").eql(__('LOGIN_FAILED'))
          done();
        });
    });
  });

  describe("/List User", () => {
    it("It should return list user", done => {
      chai
        .request(app)
        .get("/api/logup")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(status.STATUS_SUCCESS);
          res.body.should.have.property("success").eql(true);
          res.body.should.have.property("data").which.is.an("array");
          res.body.data[0].should.have.property("email");
          res.body.data[0].should.have.property("active");
          done();
        });
    });
  });
}

module.exports = test_login;
