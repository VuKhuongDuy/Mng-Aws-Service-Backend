var AWS = require("aws-sdk");
const {STATUS_ERROR, STATUS_SUCCESS} = require('../statusCode')
let { accountAWS_model } = require("../model/model");
let { user_model } = require("../model/model");
var i18n = require("i18n");

function AWS_my_config(req) {
  AWS.config.region = req.body.region;
  AWS.config.accessKeyId = req.body.accessKeyId;
  AWS.config.secretAccessKey = req.body.secretAccessKey;
}

exports.list = async function(req, res) {
  let user = await user_model.findById(req.user._id);
  let data = await accountAWS_model.find(
    { user: user },
    { _id: 1, name: 1, region: 1, running: 1, countInstance: 1 }
  );

  res.status(STATUS_SUCCESS).send({
    success: true,
    data
  });
};

exports.add = async (req, res) => {
  if (!req.body.name ||
     !req.body.accessKeyId || 
     !req.body.secretAccessKey || 
     !req.body.region
  ){
    res.send({
      success: false,
      message: __('INFO_EMPTY')
    })
    return;
  }
  
  AWS_my_config(req);
  const user = await user_model.findById(req.user._id)

  var ec2 = new AWS.EC2({ apiVersion: "2019-08-05" });
  var params = {};
  ec2.describeHosts(params, async function(err, data) {
    if (err) {
      res.status(STATUS_SUCCESS).send({
        success: false,
        message: __('INFO_ACCOUNT_WRONG')
      });

      return;
    } else {
      let account = new accountAWS_model({
        user: user,
        name: req.body.name,
        accessKeyId: req.body.accessKeyId,
        secretAccessKey: req.body.secretAccessKey,
        region: req.body.region
      });
      let accountInfo = await account.save();

      res.status(STATUS_SUCCESS).send({
        success: true,
        data: {
          name: accountInfo.name,
          region: accountInfo.region
        },
      });
    }
  });
};

exports.delete_account = async (req, res) => {
  let data = await accountAWS_model.deleteOne({ _id: req.query.id });
  res.status(STATUS_SUCCESS).send({
    success: true
  });
};
