const express = require('express');
const app = express();
//config
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
//routes modules
const user = require('./routes/user');
const notepad = require('./routes/notepad');
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
app.get('/', (req, res) => {
    return res.status(200).json({
        working: true
    })
});
app.use("/api/v1/user", user);
app.use("/api/v1/notepad", notepad);
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
    console.log("Erro de conexão\n\n" + er);
});