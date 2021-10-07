const {
    checkCurrentUser,
} = require("../middleware/middleware");
const User = require("../models/user");

module.exports = {

    get_notes: async (req, res) => {
        let user = await checkCurrentUser(req);

        if (user === null) {
            return;
        }

        res.status(201).json({
            notes: user.notes
        });
    },

    post_note: async (req, res) => {
        let user = await checkCurrentUser(req);

        if (user === null) {
            return;
        }

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

        return res.status(500).send({
            error_message: "Houve um erro no servidor."
        });
    },

    put_note: async (req, res) => {

        const {
            title,
            content,
            color
        } = req.body;
        const user = await checkCurrentUser(req);

        if (user === null) {
            return;
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
            return;
        }

        await User.updateOne({
            _id: user._id
        }, {
            $pull: {
                notes: {
                    _id: req.params.id
                }
            }
        });

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
        }).lean().catch(er => null);

        if (note) {
            return res.status(203).json({
                note: note.notes[0]
            });
        }

        return res.status(500).json({
            error_message: "Erro no servidor."
        });
    }
}