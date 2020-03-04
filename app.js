const express = require("express");
const bodyParser = require("body-parser");
const { config } = require("./config/default");
const cors = require("cors");
const mongoose = require("mongoose");
const jsonwebtoken = require("jsonwebtoken");
const { STATUS_AUTH } = require("./statusCode");
var i18n = require("i18n");
// const {RunDB} = require("./model/model")

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(i18n.init);

i18n.configure({
  locales: ["en", "vi"],
  directory: __dirname + "/locales",
  register: global
});

app.use(function(req, res, next) {
  if (req.headers.lang)
    setLocale(req.headers.lang);
  if (req.url.indexOf('docs') > 0){
    next()
  } else if (
    (req.url.indexOf("login") > 0 || req.url.indexOf("logup") > 0 ) &&
    req.method === "POST"
  ) {
    req.user = undefined;
    next();
  } else if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(" ")[1],
      "RESTFULAPIs",
      function(err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    res.status(STATUS_AUTH).send({
      message: "Unauthorized user!"
    });
  }
});


app.use(express.static('./dist'))
app.get('/', (req, res)=>{
  res.sendFile('index.html')
})

app.use("/", require("./router/router.js"));

var DB_HOST = config.DB_HOST_dev;

/* istanbul ignore next */
if (process.env.NODE_ENV === "test") {
  DB_HOST = config.DB_HOST_test;
}

async function RunDB(DB_HOST) {
  await mongoose.connect(`${config.MONGO_PATH}/${DB_HOST}`, {
    useNewUrlParser: true,
    useFindAndModify: true
  });
}

RunDB(DB_HOST)
  .then(() => {
    console.log(`Connected Database : ${config.MONGO_PATH}`);
  })
  .catch(() => {
    /* istanbul ignore next */
    console.log("Can not connect to DB");
    /* istanbul ignore next */
    process.exit(1);
  });

app.listen(config.PORT, () => {
  console.log(`Run server on port ${config.PORT}`);
});

module.exports = app;
