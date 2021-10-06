const express = require('express');
const app = express();
//config
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
//routes modules
const user = require('./routes/user');
const notes = require('./routes/notes');
//database credentials
const config = require('./config/config');

//body-parser
app.use(express.json())

//middlewares
app.use(cookieParser())
app.use(cors({
    allowedHeaders: '*',
}));
app.use(morgan('tiny'));

//routes - start
app.use("/api/v1/user", user);
app.use("/api/v1/notes", notes);
//404 handling
app.get('*', (req, res) => {
    return res.status(404).json({
        error: "Not found"
    })
});


//Database connection and app start.
mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    app.listen(config.PORT, () => {
        console.log("Server is running at http://localhost:" + config.PORT);
    })
}).catch((er) => {
    console.log("Erro de conexão\n" + er);
});