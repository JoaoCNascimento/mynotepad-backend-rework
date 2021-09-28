const User = require('../models/user');
const authConfig = require('../config/auth.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
    isEmail,
    isDate
} = require('validator');
const maxAge = 1920000;
const {
    checkCurrentUser
} = require('../middleware/middleware')

module.exports = {
    // get user
    get_user: async (req, res) => {
        const user = await checkCurrentUser(req);

        user.password = undefined;

        if (user) {
            return res.status(201).json({
                user
            });
        } else {
            return res.status(500).json({
                error_message: 'Erro no servidor.'
            })
        }
    },
    // post user
    post_user: async (req, res) => {

        const {
            name,
            email,
            birthDate,
            password
        } = req.body;

        if (!name || name.length <= 2) {
            return res.status(200).json({
                error_message: 'O campo de nome deve ter no mínimo 3 caracteres.'
            });
        }

        if (!email || !isEmail(email)) {
            return res.status(200).json({
                error_message: 'Email inválido.'
            });
        }

        let checkEmail = await User.findOne({
            email: email.toLowerCase()
        });

        if (checkEmail) {
            return res.status(200).send({
                error_message: 'Email já está em uso.'
            });
        }

        if (!birthDate || !isDate(birthDate)) {
            return res.status(200).json({
                error_message: 'Formato de data inválido.'
            })
        }

        if (!password || password.length < 6) {
            return res.status(200).json({
                error_message: 'A senha deve possuir pelo menos 6 caracteres.'
            })
        }

        const user = await User.create({
            name,
            email,
            birthDate,
            password
        });

        if (user) {
            let token = createToken(user.id);

            return res.status(201).json({
                ok: true,
                token
            })
        }

        return res.status(500).json({
            error_message: 'Erro no servidor.'
        })
    },
    // update user
    update_user: async (req, res) => {
        const {
            name,
            email,
            birthDate
        } = req.body;

        let user = await checkCurrentUser(req);

        let updatedUser = await User.findByIdAndUpdate(
            { _id: user._id }, 
            { name, email, birthDate }, 
            { useFindAndModify: true });

        return res.status(200).json({
            ok: true
        })
    },
    // delete user
    delete_user: async (req, res) => {
        const {
            password
        } = req.body;

        let _user = await checkCurrentUser(req);

        if (!bcrypt.compareSync(password, _user.password)) {
            return res.status(200).json({
                error_message: 'Exclusão não permitida.'
            })
        }

        let user = await User.findByIdAndDelete(_user.id);

        return res.status(200).json({
            deleted: true
        })
    },
    // Login
    post_user_login: async (req, res) => {
        const {
            email,
            password
        } = req.body;

        if (!email || !isEmail(email)) {
            return res.status(200).json({
                error_message: 'Digite um email válido.'
            })
        }

        if (!password || password.length === 0) {
            return res.status(200).json({
                error_message: 'Digite a sua senha.'
            })
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(200).json({
                error_message: 'Senha ou email inválido(s).'
            })
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(200).json({
                error_message: 'Senha ou email inválido(s).'
            })
        }

        res.cookie('jwt', createToken(user.id), {
            maxAge
        })

        let token = createToken(user.id);

        return res.status(201).json({
            ok: true,
            token
        })
    },
    // LogOut 
    get_user_logout: (req, res) => {

        return res.status(201).json({
            ok: true
        })
    }
}

function createToken(payload) {
    return jwt.sign({
        payload
    }, authConfig.secret, {
        expiresIn: 10800,
    })
}