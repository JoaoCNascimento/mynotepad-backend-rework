const {
    checkCurrentUser,
} = require("../middleware/middleware");
const User = require("../models/user");

module.exports = {

    notepad: async (req, res) => {

        let user = await checkCurrentUser(req, res)

        return res.status(200).json(user);
    },

    note_get: (req, res) => {
        res.render('notepad/note');
    },

    note_post: async (req, res) => {
        const note = req.body;

        if (!note.title || !note.content) {
            return res.status(401).send({
                error_message: "Os campos da anotação não podem ficar em branco."
            })
        }

        if (note.title.length > 40) {
            return res.status(401).send({
                error_message: "O título da anotação não pode ter mais de 100 caracteres."
            })
        }

        if (note.content.length > 400) {
            return res.status(401).send({
                error_message: "O conteúdo da anotação não pode ultrapassar os 500 caracteres."
            })
        }

        const user = await checkCurrentUser(req, res);

        await User.updateOne({
                _id: user._id
            }, {
                $push: {
                    notes: {
                        title: note.title,
                        content: note.content,
                        color: note.color
                    }
                }
            })
            .then((note) => {
                return res.status(200).send({
                    note: note
                })
            })
            .catch((er) => {
                console.log(er);
                return res.status(500).send({
                    error_message: "Erro no servidor, tente novamente mais tarde."
                })
            })
    },

    note_edit_get: async (req, res) => {

        const user = await checkCurrentUser(req, res);
        const note = await checkNote(user._id, req.params.id);

        if (!note) {
            return res.redirect('/notepad');
        }

        return res.send(200).json({
            note: note,

            colors: {
                yellow: "yellow",
                blue: "blue",
                black: "black",
                green: "green",
                pink: "pink",
                red: "red",
                white: "white"
            }
        })
    },

    note_delete: async (req, res) => {
        const user = await checkCurrentUser(req, res);
        const data = await deleteNote(user._id, req.params.id);

        if (data) {
            return res.status(200).json({
                success: "Excluída com sucesso."
            })
        }
        return res.status(200).json({
            error_message: "Houve um erro no servidor, tente novamente mais tarde."
        })
    },

    note_put: async (req, res) => {

        const user = await checkCurrentUser(req, res);
        const noteUpdated = await updateNote(user._id, req.params.id, req.body);

        if (!noteUpdated) {
            return res.status(500).json({
                error_message: "Não foi possível salvar as alterações, tente novamente mais tarde."
            })
        }

        return res.status(200).json({
            success: "Alterações salvas com êxito!"
        })

    },

    user_profile: async (req, res) => {
        const user = await checkCurrentUser(req, res);

        let dateFormat = () => {
            let day = user.birthDate.substring(8, 10);
            let month = user.birthDate.substring(5, 7);
            let year = user.birthDate.substring(0, 4);
            let formattedBirthDate = day + "/" + month + "/" + year;
            return formattedBirthDate;
        }

        user.birthDate = dateFormat();

        return res.status(200).json({
            user
        });
    },
}

//NOTE CRUD 
//UPDATE
const updateNote = async (user_id, note_id, newNote) => {

    const result = await User.updateOne({
            _id: user_id,
            'notes._id': note_id
        }, {
            '$set': {
                'notes.$.title': newNote.title,
                'notes.$.content': newNote.content,
                'notes.$.color': newNote.color,
                'notes.$.updatedAt': Date.now()
            }
        })
        .then((note) => {
            return true;
        })
        .catch((er) => {
            console.log("Erro:" + er);
            return false;
        })

    return result;
}

//READ 
//this function look for an specific note inside a user collection
const checkNote = async (user_id, note_id) => {

    let note = await User.findOne({
        _id: user_id
    }, {
        notes: {
            $elemMatch: {
                _id: note_id
            }
        }
    }).lean().catch(() => {
        return false;
    });

    if (note) {
        note = note.notes;
        return note;
    } else {
        return false;
    }
}

//DELETE
//this function look for an specific note inside a user collection 
//and then delete it
const deleteNote = async (user_id, note_id) => {
    const result = await User.updateOne({
            _id: user_id
        }, {
            $pull: {
                notes: {
                    _id: note_id
                }
            }
        })
        .then(() => {
            return true;
        })
        .catch((er) => {
            return false;
        });

    return result;
}