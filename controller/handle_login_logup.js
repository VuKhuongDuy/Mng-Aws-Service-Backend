var nodemailer = require("nodemailer");
var { user_model } = require("../model/model");
var { config } = require("../config/default");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  STATUS_BADREQUEST
} = require("../statusCode");

// const EMAIL_SERVER = "vukhuongduy2305@gmail.com";

const option = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_HOST || 'vukhuongduy2305@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'manunited230599'
  }
};

var transporter = nodemailer.createTransport(option);

let send_email = async function(mail) {
  await transporter.sendMail(mail);
};

let random_code = () => {
  let code = parseInt(Math.random() * (999999 - 000000));

  return code;
};

exports.list_user = async function(req, res) {
  let data = await user_model.find();

  res.status(STATUS_SUCCESS).send({
    success: true,
    data
  });
};

exports.verify_email = async (req, res) => {
  if (!req.body.email) {
    res.send({
      success: false,
      message: __("INFO_EMPTY")
    });
    return;
  }

  var user_email = await user_model.findOne({ email: req.body.email });
  if (user_email && user_email.active === true) {
    res.status(STATUS_SUCCESS).send({
      success: false,
      active: true,
      message: __("EMAIL_EXIST")
    });

    return;
  } else if (user_email && user_email.active === false) {
    res.status(STATUS_SUCCESS).send({
      success: false,
      active: false,
      message: __("EMAIL_NO_VERIFY")
    });
    return;
  }

  var code = random_code();
  var mail = {
    from: process.env.EMAIL_HOST,
    to: req.body.email,
    subject: __("SUBJECT_MAIL"),
    text: "Manager aws service",
    html: `<h4>${__("HTML_MAIL")}: ${code}</h4>`
  };
  send_email(mail)
    .then(async () => {
      let password = "";
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);
      let user = new user_model({
        username: req.body.username,
        password: hash,
        email: req.body.email,
        active: false,
        code: code
      });

      await user.save();
      user.password = undefined;
      res.status(STATUS_SUCCESS).send({
        success: true,
        user
      });
    })
    .catch(err => {
      res.status(STATUS_ERROR).send({
        success: false,
        error: err
      });
    });
};

exports.create_user = async (req, res) => {
  if (!req.body.email || !req.body.code) {
    res.send({
      success: false,
      message: __("INFO_EMPTY")
    });
    return;
  }
  var user = await user_model.findOne({ email: req.body.email });
  if (req.body.code !== user.code) {
    res.status(STATUS_SUCCESS).send({
      success: false,
      message: __("CODE_WRONG")
    });

    return;
  }

  const data = await user_model.updateOne(
    { email: req.body.email },
    { $set: { active: true } }
  );
  res.status(STATUS_SUCCESS).send({
    success: true,
    data: data._id
  });
};

exports.check_login = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.send({
      success: false,
      message: __("INFO_EMPTY")
    });
    return;
  }
  let user = await user_model.findOne({
    username: req.body.username,
    active: true
  });

  if (user && user.comparePassword(req.body.password)) {
    var payload = { username: user.username };
    var jwtToken = jwt.sign(
      { email: user.email, username: user.username, _id: user._id },
      "RESTFULAPIs"
    );
    res.status(STATUS_SUCCESS).send({
      success: true,
      token: jwtToken
    });
  } else {
    res.status(STATUS_SUCCESS).send({
      success: false,
      message: __("LOGIN_FAILED")
    });
  }
};
