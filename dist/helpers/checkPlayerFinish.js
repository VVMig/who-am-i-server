"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPlayerFinish = void 0;
const checkPlayerFinish = (room) => {
    return (room.answers.filter((answer) => answer.isGuessed).length ===
        room.participants.length - 1);
};
exports.checkPlayerFinish = checkPlayerFinish;
