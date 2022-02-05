const {
    checkCurrentUser,
} = require("../middleware/middleware");
const User = require("../models/user");

module.exports = {

    get_notes: async (req, res) => {
        let user = await checkCurrentUser(req);

        if(user === null)
            return;

        return res.status(201).json({
            notes: user.notes
        });
    },

    post_note: async (req, res) => {
        let user = await checkCurrentUser(req);

        if (user === null) {
            return res.status(404).json({ error_message: "Invalid token, user not found." });
        }

        try {
            const {
                title,
                content,
                color
            } = req.body;

            let note = await User.updateOne({
                _id: user._id
            }, {
                $push: {
                    notes: {
                        title,
                        content,
                        color
                    }
                }
            })
    
            if (note) {
                return res.status(201).json({
                    ok: true
                });
            }
        }
        catch(err)
        {
            return res.status(500).json({ error_message: "Houve um erro no servidor." })
        }

    },

    put_note: async (req, res) => {

        const {
            title,
            content,
            color
        } = req.body;

        if (!title || !content || !color) {
            return res.status(400).json({ error_message: "Some fields are missing." })
        }

        const user = await checkCurrentUser(req);

        if (user === null) {
            return res.status(404).json({ error_message: "Invalid token, user not found." });
        }

        const noteUpdated = await User.updateOne({
            _id: user._id,
            'notes._id': req.params.id
        }, {
            '$set': {
                'notes.$.title': title,
                'notes.$.content': content,
                'notes.$.color': color,
                'notes.$.updatedAt': new Date()
            }
        });

        if (noteUpdated) {
            return res.status(200).json({
                ok: true
            })
        }

        return res.status(500).json({
            error_message: "Houve um erro no servidor."
        })
    },

    delete_note: async (req, res) => {
        let user = await checkCurrentUser(req);

        if (user === null) {
            return res.status(404).json({ error_message: "Invalid token, user not found." });
        }

        await User.updateOne({
            _id: user._id
        }, {
            $pull: {
                notes: {
                    _id: req.params.id
                }
            }
        }).catch(er => console.log("Erro ao deletar"));

        return res.status(200).send({
            ok: true
        });
    },

    get_note: async (req, res) => {
        const user = await checkCurrentUser(req);

        if (user === null) {
            return;
        }

        let note = await User.findOne({
            _id: user._id
        }, {
            notes: {
                $elemMatch: {
                    _id: req.params.id
                }
            }
        }).lean().catch(er => console.log("Erro ao procurar anotação por id."));

        if (note && note.notes) {
            return res.status(203).json({
                note: note.notes[0]
            });
        }

        return res.status(404).json({ error_message: "Note not found." });
    }
}