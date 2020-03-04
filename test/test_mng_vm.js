var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var should = chai.should();
var app = require("../app.js");
let handle_vm = require('../controller/handle_vm')
var { user_model, plan_model, accountAWS_model } = require("../model/model");
let tokenAuth = require('./tokenAuth')

chai.use(chaiHttp);

function test_mng_vm() {
  const time = Date.now();

  beforeEach(done => {
    done();
  });

  describe("/Create a VM", () => {
    it("It should create success a VM", done => {
      let data = {
        Name: "vm-test",
        ImageId: "ami-0b37e9efc396e4c38",
        InstanceType: "t2.micro",
        KeyName: "duy-key",
        MinCount: 1,
        MaxCount: 1,
        AccountName: "account1"
      };
      chai
        .request(app)
        .post("/api/vms/create")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });

    it("It shouldn't create success a VM", async done => {
      let account = await accountAWS_model.findOne();
      let data = {
        Name: "vm-test1",
        ImageId: "a",
        InstanceType: "t2.micro",
        KeyName: "duy-k",
        MinCount: 1,
        MaxCount: 1,
        AccountName: account.name
      };
      chai
        .request(app)
        .post("/api/vms/create")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/Get list VM", () => {
    it("It should get list vm", async function(done) {
      const account = await accountAWS_model.findOne();

      chai
        .request(app)
        .post("/api/vms")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .send({ id: account._id })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          res.body.should.have.property("data").which.is.an("array");
          done();
        });
    });
  });

  describe("/Start a VM", () => {
    it("It should start a VM", async done => {
      const id = "i-0a1c904206960e12a";
      const account = await accountAWS_model.findOne();
      chai
        .request(app)
        .put("/api/vms/start?id=" + id + "&&idAccount=" + account._id)
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });

    it("It shouldn't start a VM", async done => {
      const id = "f66ecc9d6bbc1";
      const account = await accountAWS_model.findOne();
      chai
        .request(app)
        .put("/api/vms/start?id=" + id + "&&idAccount=" + account._id)
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/Stop a VM", () => {
    it("It should stop a VM", async done => {
      const id = "i-0a1c904206960e12a";
      const account = await accountAWS_model.findOne();
      chai
        .request(app)
        .put("/api/vms/stop?id=" + id + "&&idAccount=" + account._id)
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });

    it("It shouldn't stop a VM", async done => {
      const id = "f66ecc9d6bbc1";
      const account = await accountAWS_model.findOne();
      chai
        .request(app)
        .put("/api/vms/stop?id=" + id + "&&idAccount=" + account._id)
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/Make plan", () => {
    it("make plan with key name success", async done => {
      const user = await user_model.find({})
      const aPlan = {
        action: "start",
        typePlan: "key_name",
        valueObjectPlan: "duy-key",
        dateTime: Date.now(),
        schedule: 'daily',
        user: user[0]
      };

      chai
        .request(app)
        .post("/api/vms/make-plan")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .send(aPlan)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          res.body.should.have.property('data')
          res.body.data.should.have.property('typePlan').eql('key_name')
          res.body.data.should.have.property('action').eql('start')
          res.body.data.should.have.property('schedule').eql('daily')
          done();
        });
    });

    it("make plan with key name success", async done => {
      const user = await user_model.find({})[0]
      const aPlan = {
        action: "stop",
        typePlan: "key_name",
        valueObjectPlan: "duy-key",
        dateTime: Date.now(),
        schedule: 'daily',
        user: user
      };

      chai
        .request(app)
        .post("/api/vms/make-plan")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .send(aPlan)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          res.body.should.have.property('data')
          res.body.data.should.have.property('typePlan').eql('key_name')
          res.body.data.should.have.property('action').eql('stop')
          res.body.data.should.have.property('schedule').eql('daily')
          done();
        });
    });
  });

  describe("/Check plan", () => {
      it("Check plan instance_id", async (done)=>{
        const date = new Date();
        const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        const dateStr = date.getFullYear() +
        "-" +
        (parseInt(date.getMonth()) + 1) +
        "-" +
        date.getDate();
        const aPlan = new plan_model({
          typePlan: 'instance_id',
          valueObjectPlan: 'i-0a1c904206960e12a&&account1',
          dateTime: Date.now(),
          action: 'start',
          schedule: 'daily'
        })
        await aPlan.save()

        handle_vm.checkPlan()
        done()
      })

      it("Check plan account_name", async (done)=>{
        const date = new Date();
        const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        const dateStr = date.getFullYear() +
        "-" +
        (parseInt(date.getMonth()) + 1) +
        "-" +
        date.getDate();
        const aPlan = new plan_model({
          typePlan: 'account_name',
          valueObjectPlan: 'account1',
          dateTime: Date.now(),
          action: 'stop',
          schedule: 'daily'
        })
        await aPlan.save()

        handle_vm.checkPlan()
        done()
      })

      it("Check plan key name", async (done)=>{
        const date = new Date();
        const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        const dateStr = date.getFullYear() +
        "-" +
        (parseInt(date.getMonth()) + 1) +
        "-" +
        date.getDate();
        const aPlan = new plan_model({
          typePlan: 'key_name',
          valueObjectPlan: 'duy-key',
          dateTime: Date.now(),
          action: 'stop',
          schedule: 'daily'
        })
        await aPlan.save()

        handle_vm.checkPlan()
        done()
      })

      it("Check plan key name", async (done)=>{
        const date = new Date();
        const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        const dateStr = date.getFullYear() +
        "-" +
        (parseInt(date.getMonth()) + 1) +
        "-" +
        date.getDate();
        const aPlan = new plan_model({
          typePlan: 'key_name',
          valueObjectPlan: 'duy-key',
          dateTime: Date.now(),
          action: 'stop',
          schedule: 'no daily'
        })
        await aPlan.save()

        handle_vm.checkPlan()
        done()
      })
  })

  describe("/List plan", () => {
    it("It should return list plan", done => {
      chai
        .request(app)
        .get("/api/vms/plans")
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          res.body.should.have.property("data").which.is.an("array");
          done();
        });
    });
  });

  describe("/Delete plan", () => {
    it("It should delete a plan and return list plan", async done => {
      const plan = await plan_model.findOne({})
      chai
        .request(app)
        .delete( "/api/vms/delete-plan?id=" + plan._id )
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });
  });

  describe("/Delete VM", () => {
    // it("It should delete a vm", async done => {
    //   let id = "i-0a1c904206960e12a";
    //   let account = await accountAWS_model.findOne({});
    //   chai
    //     .request(app)
    //     .delete("/api/vms?id=" + id + "&&idAccount=" + account._id)
    //     .end((err, res) => {
    //       res.should.have.status(200);
    //       res.body.should.have.property("success").eql(true);
    //       res.body.should.have.property("data").which.is.an("array");
    //       done();
    //     });
    // });

    it("It shouldn't delete a vm", async done => {
      let id = "dsasdf";
      let account = await accountAWS_model.findOne({});

      chai
        .request(app)
        .delete("/api/vms?id=" + id.id + "&&idAccount=" + account._id)
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(false);
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/Delete account", () => {
    it("It should delete an account", async done => {
      let account = await accountAWS_model.findOne(
        { region: "us-west-2" },
        { _id: 1 }
      );
      chai
        .request(app)
        .delete("/api/accountaws?id=" + account._id)
        .set('Authorization', 'JWT '+ tokenAuth.getTokenAuth())
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("success").eql(true);
          done();
        });
    });
  });
}

module.exports = test_mng_vm;
