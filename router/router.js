const express = require("express");
let router = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./dist/swagger.yaml");
var options = {
  swaggerOptions: {
    authAction: {
      JWT: {
        name: "JWT",
        schema: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: ""
        },
        value: "Bearer <JWT>"
      }
    }
  }
};
router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(swaggerDocument, options));

router.use("/api/login", require("./login_logup/r_login.js"));
router.use("/api/logup", require("./login_logup/r_logup.js"));
router.use("/api/accountaws", require("./accountAWS/r_accountAWS.js"));
router.use("/api/vms", require("./vm/r_vm.js"));
router.use("/api/lang", require("./lang/handle_lang"));

module.exports = router;
