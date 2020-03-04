const mongoose = require("mongoose");
const { config } = require("../config/default.js");
var bcrypt = require("bcryptjs");

let user_schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    code: {
      type: String,
      required: true
    }
  },
  { versionKey: false }
);

user_schema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password)
}

let accountAWS_schema = new mongoose.Schema(
  {
    user: user_schema,
    name: {
      type: String,
      required: true
    },
    accessKeyId: {
      type: String,
      required: true
    },
    secretAccessKey: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    running: {
      type: Number,
      default: 0
    },
    countInstance: {
      type: Number,
      default: 0
    }
  },
  { versionKey: false }
);

let plan_schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_schema'
  },
  typePlan: {
    type: String,
    required: true
  },
  valueObjectPlan: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  date: {
    type: String,
  },
  time:{
    type: String
  },
  action: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    required: true
  }
}, {versionKey: false});

const user_model = mongoose.model("user", user_schema);
const accountAWS_model = mongoose.model("accountaws", accountAWS_schema);
const plan_model = mongoose.model("plans", plan_schema);


module.exports.user_model = user_model;
module.exports.accountAWS_model = accountAWS_model;
module.exports.plan_model = plan_model;
