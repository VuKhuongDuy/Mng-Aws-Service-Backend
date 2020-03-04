process.env.NODE_ENV = "test";
let chai = require("chai");
let chaiHttp = require("chai-http");
const test_login = require("./test_login.js")
const test_manager_account = require('./test_mng_account.js')
const test_manager_vm = require('./test_mng_vm.js')

describe("User", test_login)
describe("ManagerAccount", test_manager_account)
describe('ManagerVM', test_manager_vm)