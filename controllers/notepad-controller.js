const {
    checkCurrentUser,
} = require("../middleware/middleware");
const User = require("../models/user");

module.exports = {

    get_notes: async (req, res) => {
        let user = await checkCurrentUser(req);
        res.status(201).json({notes: user.notes})
    },

    post_note: async(req, res) => {
        let user = await checkCurrentUser(req);

        const {title, description, color} = req.body;

        let note = await User.updateOne(
            {_id: user._id},
            {
                $push: {
                    notes: {
                        title,
                        description,
                        color
                    }
                }
            })

            console.log(await User.findOne({
                _id: user._id
            }));

        if(note) {
            return res.status(201).json({ ok: true});
        }

        return res.status(500).send({error_message: "Houve um erro no servidor."});
    },

    put_note: async (req, res) => {

        const {title, description, color} = req.body;
        const user = await checkCurrentUser(req);
        const noteUpdated = await User.updateOne(
            { _id: user._id, 'notes._id': req.params.id}, 
            {
                '$set': {
                    'notes.$.title': title,
                    'notes.$.description': description,
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

        await User.updateOne(
            {_id: user._id},
            {
                $pull: {
                    notes: {
                        _id: req.params.id
                    }
                }
            }
        );

        return res.status(200).send({ok: true});
    },

    get_note: async (req, res) => {
        const user = await checkCurrentUser(req);
        
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
            return res.status(203).json({ note: note.notes[0]} );
        }

        return res.status(500).json({error_message: "Erro no servidor."});
    }
}