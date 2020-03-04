var AWS = require("aws-sdk");
const {STATUS_ERROR, STATUS_SUCCESS} = require('../statusCode')
var { accountAWS_model, plan_model, user_model } = require("../model/model");

exports.plansComplete = [];

/* istanbul ignore next */
function AWS_my_config(account) {
  AWS.config.region = account.region;
  AWS.config.accessKeyId = account.accessKeyId;
  AWS.config.secretAccessKey = account.secretAccessKey;
}

exports.listvm = async function(req, res) {
  try {
    const account = await accountAWS_model.findById(req.body.id );
    /* istanbul ignore next */
    if (!account){
      res.send({ success: false, message:__('NOT_FOUND_ACCOUNT')});
      return;
    }
    /* istanbul ignore next */
    AWS_my_config(account);
    let date = new Date();
    var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
    var params = { DryRun: false };
    ec2.describeInstances(params, function(err, data) {
      res.status(STATUS_SUCCESS).send({ success: true, data: data.Reservations });
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(STATUS_ERROR).send({ success: false, error: err });
  }
};

exports.create = async (req, res) => {
  /* istanbul ignore next */
  if (!req.body.AccountName ||
    !req.body.ImageId ||
    !req.body.InstanceType ||
    !req.body.KeyName ||
    !req.body.MinCount  ||
    !req.body.MaxCount
  ){
    res.send({
      success: false,
      message: __('INFO_EMPTY')
    });
    return;
  }

  let account = await accountAWS_model.findOne({
    "name": req.body.AccountName
  });
  if (!account){
    res.send({
      success: false,
      message: __('NOT_FOUND_ACCOUNT')
    });
    return;
  }
  AWS_my_config(account);
  var isntanceParams = {
    ImageId: req.body.ImageId,
    InstanceType: req.body.InstanceType,
    KeyName:  req.body.KeyName,
    MinCount: req.body.MinCount,
    MaxCount: req.body.MaxCount
  };

  let date = new Date();
  var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });

  ec2.runInstances(isntanceParams, function(err, data) {
    if (data) {
      var instanceId = data.Instances[0].InstanceId;

      tagParams = {
        Resources: [instanceId],
        Tags: [
          {
            Key: "Name",
            Value: req.body.Name
          }
        ]
      };
      var tagPromise = new AWS.EC2({ apiVersion: "2016-11-15" })
        .createTags(tagParams)
        .promise();

      tagPromise
        .then(()=>{})
        .catch(() => {});

      res.status(STATUS_SUCCESS).send({ success: true, message: __('ADD_SUCCESS') });
    } else {
      res.status(STATUS_SUCCESS).send({
        success: false,
        message: __('CREATE_INSTANCE_FAILED')
      });
    }
  });
};

exports.delete_vm = async (req, res) => {
  if (!req.query.idAccount){
    res.send({
      success: false,
      message: __('INFO_EMPTY')
    })
    return;
  }
  const account = await accountAWS_model.findOne({ _id: req.query.idAccount });
  AWS_my_config(account);
  /* istanbul ignore next */
  let date = new Date();
  var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
  var isntanceParams = {
    InstanceIds: [req.query.id]
  };

  await ec2.terminateInstances(isntanceParams, function(err, data) {
    /* istanbul ignore else */
    if (err)
    res.status(STATUS_SUCCESS).send({ success: false, message: __('NOT_FOUND_INSTANCE') });
    else {
      res.status(STATUS_SUCCESS).send({ success: true, data: data.TerminatingInstances });
    }
  });
};

exports.start = async (req, res) => {
  try {
    if (!req.query.idAccount){
      res.send({
        success: false,
        message: __('INFO_EMPTY')
      })
      return;
    }
    const account = await accountAWS_model.findOne({
      _id: req.query.idAccount
    });
    AWS_my_config(account);
    let date = new Date();
    var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
    const promise = start(req.query.id, ec2);
    promise
      .then(data => {
        res.status(STATUS_SUCCESS).send({ success: true, data: data });
      })
      /* istanbul ignore next */
      .catch(err => {
        res.status(STATUS_SUCCESS).send({ success: false, message: err });
      });
    }
  catch (err) {
    /* istanbul ignore next */ 
    res.status(STATUS_ERROR).send({ success: false, error: err });
  }
};

exports.stop = async (req, res) => {
  try {
    if (!req.query.idAccount){
      res.send({
        success: false,
        message: __('INFO_EMPTY')
      })
      return;
    }
    const account = await accountAWS_model.findOne({
      _id: req.query.idAccount
    });
    AWS_my_config(account);
    let date = new Date();
    var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
    const promise = stop(req.query.id, ec2);
    promise
      .then(data => {
        res.status(STATUS_SUCCESS).send({ success: true, data: data });
      })
      .catch(err => {
        /* istanbul ignore next */
        res.status(STATUS_SUCCESS).send({ success: false, message: err });
      });
    } 
    catch (err) {
      /* istanbul ignore next */
    res.status(STATUS_ERROR).send({ success: false, error: err });
  }
};

// async function test(instanceId, ec2) {
//   const data = stop( instanceId, ec2 );
//   data.then((res)=>{
//     console.log(res)
//   })
//   .catch((err)=>{
//     console.log(err)
//   })
//    // await is actually optional here
//   // console.log(data)
// }

function start(instanceId, ec2) {
  var isntanceParams = { InstanceIds: [instanceId] };

  return new Promise((resolve, reject) => {
    ec2.startInstances(isntanceParams, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

function stop(instanceId, ec2) {
  var isntanceParams = { InstanceIds: [instanceId] };

  return new Promise((resolve, reject) => {
    ec2.stopInstances(isntanceParams, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

exports.makePlan = async (req, res) => {
  if (!req.body.dateTime || 
    !req.body.typePlan ||  
    !req.body.valueObjectPlan ||
    !req.body.action ||
    !req.body.schedule 
  ){
    res.send({
      success: false,
      message: __('INFO_EMPTY')
    })
    return;
  }
  const dateTime = new Date(req.body.dateTime)
  const date = convertNumberToDateTime(dateTime.getTime())
  const time = dateTime.getHours() +":"+ dateTime.getMinutes() +":"+ dateTime.getMilliseconds()
  let aPlan = new plan_model({
    user: req.user._id,
    typePlan: req.body.typePlan,
    valueObjectPlan: req.body.valueObjectPlan,
    dateTime: req.body.dateTime,
    date: date,
    time: time,
    action: req.body.action,
    schedule: req.body.schedule
  });

  let data = await aPlan.save();
  res.status(STATUS_SUCCESS).send({ success: true, data });
};

exports.checkPlan = async () => {
  let plans = await plan_model.find({});
  let data = [];
  plans.forEach(async plan => {
    // let dateTime = convertDateTimeToNumber(plan.date, plan.time);
    if (compareTimePlanWithNow(plan.dateTime.getTime())) {
      data.push(plan);
      doPlan(plan);
      if (plan.schedule != "daily") {
        await plan_model.deleteOne({ _id: plan._id });
      } else {
        let dateTime = new Date(increaseDayForTime(plan.dateTime.getTime()));
        const date = convertNumberToDateTime(dateTime.getTime())
        await plan_model.updateOne(
          { _id: plan._id },
          {
            $set: {
              dateTime: dateTime,
              date: date
            }
          }
        );
      }
    }
  });
  // res.status(STATUS_SUCCESS).send({success: true, data})
};

let increaseDayForTime = time => {
  return time + 24 * 60 * 60 * 1000;
};

let convertDateTimeToNumber = (date, time) => {
  const timeArr = time.split(":");
  const dateTime = new Date(date);
  dateTime.setHours(timeArr[0]);
  dateTime.setMinutes(timeArr[1]);
  dateTime.setSeconds(timeArr[2]);
  return dateTime.getTime();
};

let convertNumberToDateTime = number => {
  let date = new Date(number);
  const dateStr =
    date.getFullYear() +
    "-" +
    (parseInt(date.getMonth()) + 1) +
    "-" +
    date.getDate();

  return dateStr;

};

let compareTimePlanWithNow = time => {
  if (time - Date.now() <= 10000 && time - Date.now() >= -10000) {
    return true;
  }

  return false;
};

let doPlan = async plan => {
  if (plan.typePlan === "instance_id") {
    doPlanWithInstanceId(plan);
  } else if (plan.typePlan === "key_name") {
    doPlanWithKeyName(plan);
  } else {
    doPlanWithAccountName(plan);
  }
};

let doPlanWithInstanceId = async plan => {
  let objIdAndName = takeInstanceIdAndAccountName(plan.valueObjectPlan);
  const account = await accountAWS_model.findOne({
    name: objIdAndName.accountName
  });
  const instanceId = objIdAndName.instanceId;

  AWS_my_config(account);
  let date = new Date();
  var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
  /* istanbul ignore else */
  if (plan.action === "start") {
    const promise = start(instanceId, ec2);
  } else {
    const promise = stop(instanceId, ec2);
  }
};

let takeInstanceIdAndAccountName = value => {
  let arr = value.split("&&");

  return {
    instanceId: arr[0],
    accountName: arr[1]
  };
};

let doPlanWithKeyName = async plan => {
  const accounts = await accountAWS_model.find();
  accounts.forEach(account => {
    AWS_my_config(account);
    let date = new Date();
    var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
    var params = {
      DryRun: false,
      Filters: [{ Name: "key-name", Values: [plan.valueObjectPlan] }]
    };
    ec2.describeInstances(params, function(err, data) {
      /* istanbul ignore next */
      data.Reservations.forEach(instance => {
        if (plan.action === "start")
          start(instance.Instances[0].InstanceId, ec2);
        if (plan.action === "stop") stop(instance.Instances[0].InstanceId, ec2);
      });
    });
  });
};

let doPlanWithAccountName = async plan => {
  const account = await accountAWS_model.findOne({
    name: plan.valueObjectPlan
  });
  AWS_my_config(account);
  let date = new Date();
  var ec2 = new AWS.EC2({ apiVersion: date.toDateString() });
  var params = { DryRun: false };
  ec2.describeInstances(params, function(err, data) {
    /* istanbul ignore next */
    if (!err)
    /* istanbul ignore next */
      data.Reservations.forEach(instance => {
        if (plan.action === "start")
          start(instance.Instances[0].InstanceId, ec2);
        if (plan.action === "stop") stop(instance.Instances[0].InstanceId, ec2);
      });
  });
};

exports.listPlan = async (req, res) => {
  const data = await plan_model.find({user: req.user._id}).populate("user_schema")
  res.status(STATUS_SUCCESS).send({ success: true, data });
};

exports.deletePlan = async (req, res) => {
  if (!req.query.id){
    res.send({
      success: false,
      message: __('INFO_EMPTY')
    })
    return;
  }
  const data = await plan_model.deleteOne({ _id: req.query.id });
  res.status(STATUS_SUCCESS).send({ success: true});
};

setInterval(() => {
  this.checkPlan();
}, 7000);

// function conver_data(list_plan) {
//   let data = [];
//   list_plan.forEach(plan => {
//     let element = {
//       instanceId: plan.instanceId,
//       action: plan.action,
//       date_time: plan.date_time
//     };
//     data.push(element);
//   });
//   return data;
// }
