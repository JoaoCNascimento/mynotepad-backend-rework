const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const noteSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 50
    },

    content: {
        type: String,
        required: true,
        maxLength: 400
    },

    color: {
        type: String,
        enum: ['blue', 'yellow', 'black', 'red', 'green', 'pink', 'white', 'orange']
    }
}, {
    timestamps: true
})

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true,
        maxLength: 100
    },

    email: {
        type: String,
        required: true,
        unique: true,
        maxLength: 255
    },

    birthDate: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },

    notes: [noteSchema]
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {

    this.email = this.email.toLowerCase();

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

const User = mongoose.model('user', userSchema);

module.exports = User;