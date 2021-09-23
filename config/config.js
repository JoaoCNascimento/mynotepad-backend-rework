require('dotenv').config();

if (process.env.NODE_ENV == "production") {
    module.exports = {
        connectionString: process.env.DB_PRODUCTION_CONNECTION_STRING,
        PORT: process.env.PORT
    };
} else {
    module.exports = {
        connectionString: process.env.DB_DEVELOPMENT_CONNECTION_STRING,
        PORT: 8089
    };
}