"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextStep = void 0;
const nextStep = (room, gameUser) => {
    room.step += 1;
    while (room.participants[room.step % room.participants.length].isFinish) {
        room.step += 1;
    }
    gameUser.correctAnswers = 0;
};
exports.nextStep = nextStep;
