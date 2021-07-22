"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameUser = void 0;
const mongoose_1 = require("mongoose");
const gameUserSchema = new mongoose_1.Schema({
    displayName: {
        type: String,
    },
    color: {
        type: String,
    },
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Room',
    },
    guessName: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isFinish: {
        type: Boolean,
        default: false,
    },
    namingUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GameUser',
    },
    seterUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GameUser',
    },
    correctAnswers: {
        type: Number,
        default: 0,
    },
});
exports.GameUser = mongoose_1.model('GameUser', gameUserSchema);
