const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');
const User = require('../models/user');

//auth middleware
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;

    //check token existence
    if (!token)
        return res.status(401).send({
            error_message: 'Token not provided.'
        })

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error_message: 'Invalid token.'
            })
        }
    })

    next();
};

//Get the current user by decoding the token
const checkCurrentUser = async (req) => {
    const token = req.headers.authorization;

    let user = jwt.verify(token, authConfig.secret, async (err, decoded) => {

        let findUser = await User.findById(decoded.payload);

        if (findUser) {
            return findUser;
        }
    })

    return user;
}

module.exports = {
    requireAuth,
    checkCurrentUser,
};