"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGameFinish = void 0;
const checkGameFinish = (room) => {
    return (room.participants.filter((participant) => participant.isFinish).length ===
        room.participants.length);
};
exports.checkGameFinish = checkGameFinish;
