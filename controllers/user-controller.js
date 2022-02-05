const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {
    isEmail,
    isDate
} = require('validator');
const maxAge = 1920000;
const {
    checkCurrentUser,
    checkCurrentUserByQuery,
    isTokenValid
} = require('../middleware/middleware');

const path = require('path');

const loginUrl = require('../config/config.js').loginUrl; 

module.exports = {
    // get user
    get_user: async (req, res) => {
        const user = await checkCurrentUser(req);

        if (!user)
            return null;

        user.password = undefined;
        user.notes = undefined;

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
            return res.status(400).json({
                error_message: 'O campo de nome deve ter no mínimo 3 caracteres.'
            });
        }

        if (!email || !isEmail(email)) {
            return res.status(400).json({
                error_message: 'Email inválido.'
            });
        }

        let checkEmail = await User.findOne({
            email: email.toLowerCase()
        });

        if (checkEmail) {
            return res.status(400).send({
                error_message: 'Email já está em uso.'
            });
        }

        if (!birthDate || !isDate(birthDate)) {
            return res.status(400).json({
                error_message: 'Formato de data inválido.'
            })
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                error_message: 'A senha deve possuir pelo menos 6 caracteres.'
            })
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            birthDate,
            password
        });

        if (user) {
            await send_email_confirmation(user, createToken(user.id));

            return res.status(201).json({
                ok: true
            });
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

        let updatedUser = await User.findByIdAndUpdate({
            _id: user._id
        }, {
            name,
            email,
            birthDate
        }, {
            useFindAndModify: true
        });

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
            return res.status(401).json({
                error_message: 'Exclusão não permitida.'
            })
        }

        await User.findByIdAndDelete(_user.id);

        return res.status(200).json({
            deleted: true
        })
    },
    // Login
    post_user_login: async (req, res) => {
        let {
            email,
            password
        } = req.body;

        email = email.toLowerCase();

        if (!email || !isEmail(email)) {
            return res.status(401).json({
                error_message: 'Digite um email válido.'
            })
        }

        if (!password || password.length === 0) {
            return res.status(401).json({
                error_message: 'Digite a sua senha.'
            })
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                error_message: 'Senha ou email inválido(s).'
            })
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({
                error_message: 'Senha ou email inválido(s).'
            })
        }

        if(user.status === 'Pending')
            return res.status(401).json({
                error_message: 'Ative sua conta para poder realizar o login.'
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
    },

    async send_confirmation(req, res) {
        const { email } = req.body;

        const user = await User.findOne({
            email: email
        }).then(result => {
            return result;
        }).catch(er => console.log(er));

        if(user)
            send_email_confirmation(user, createToken(user.id))

        return res.status(200).json({ ok: true });
    },

    async confirm_account(req, res) {
        const token = req.query.token;

        const validateToken = isTokenValid(token);

        if(validateToken) {
            const user = await checkCurrentUserByQuery(token);

            let _user = await User.findByIdAndUpdate({
                _id: user._id
            }, {
                status: 'Active'
            }, {
                useFindAndModify: true
            });
    
            return res.redirect(loginUrl + '?accountConfirmed=true');
        }

        return res.status(400).json({ error_message: 'Invalid token' })
    }
}

function send_email_confirmation(user, token) {

    const transporter = nodemailer.createTransport({
        service: "Outlook365",
        port: 2000,
        auth: {
            user: process.env.MAIL,
            pass: process.env.MAIL_PASSWORD,
        }
    });

    return transporter.sendMail({
        from: `MyNotepad <${process.env.MAIL}>`,
        to: user.email,
        subject: "Confirmação de email",
        html: 
            `
            <table style="border-collapse: collapse; border-radius: 5px; width: 100%;">
                <tbody style="padding: 10px; background-color: #1c1c1c; border-radius: 5px">
                    <tr>
                        <td>
                            <h1 style='font-family: "Trebuchet MS"; font-weight: 900; margin: 15px auto; color: #fff; text-align: center;'>Bem vindo ${user.name}!</h1> 
                        </td>
                    </tr>
                    <tr>
                        <td style="display: flex;">
                            <img style='margin: 10px auto;' width='300' heigth='300' src='cid:image'/> 
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style='text-align: center; font-family: roboto; color:#fff; font-size: 1.3rem; margin: 15px auto'>Agradecemos por se cadastrar em nossa plataforma :)</p> 
                        </td>
                    </tr>
                    <tr>
                        <td style="display: flex;">
                            <a style='margin: 10px; width: 100%; text-align: center; font-family: roboto; color: rgb(62, 200, 255); font-size: 1.2rem;' href='${process.env.SERVER_URL + 'confirm-account?token=' + token}'>Clique aqui para validar seu email.</a> 
                        </td>
                    </tr>
                </tbody>
            </table>
            `,
        attachments: [
            {
                cid: 'image',
                path: path.join('resources','images','mynotepad-notes.png'),
                filename: 'mynotepad-notes.png'
            }
        ]
    }).then(info => {
        console.log(info);
    }).catch(er => {
        console.log(er);
    });
}

function password_recover() {

}

function createToken(payload) {
    return jwt.sign({
        payload
    }, process.env.SECRET, {
        expiresIn: 10800,
    })
}