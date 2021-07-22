"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = require("mongoose");
const GameStage_1 = require("../GameStage");
const roomSchema = new mongoose_1.Schema({
    shareId: {
        type: String,
        unique: true,
    },
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'GameUser',
        },
    ],
    maxParticipants: {
        type: Number,
    },
    gameStage: {
        type: String,
        default: GameStage_1.GameStage.WAIT_STAGE,
    },
    question: {
        from: {
            type: String,
        },
        value: {
            type: String,
        },
    },
    step: {
        type: Number,
        default: 0,
    },
    answers: [
        {
            isGuessed: {
                type: Boolean,
            },
            value: {
                type: Boolean,
            },
            id: {
                type: String,
            },
        },
    ],
});
exports.Room = mongoose_1.model('Room', roomSchema);
