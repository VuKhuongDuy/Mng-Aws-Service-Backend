const config = {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3000,
    MONGO_PATH: process.env.DBHOST || "mongodb://127.0.0.1:27017",
    DB_HOST_dev: "Mng-AWS",
    DB_HOST_test: 'Mng-AWS-Test'
}

module.exports.config = config