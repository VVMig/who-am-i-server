"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGuessQueue = void 0;
const controllers_1 = require("../controllers");
const generateGuessQueue = (room) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    try {
        for (var _b = __asyncValues(room.participants), _c; _c = yield _b.next(), !_c.done;) {
            const participant = _c.value;
            const participants = room.participants;
            const gameUserIndex = participants.findIndex((findParticipant) => findParticipant.id === participant.id);
            const gameUser = yield controllers_1.gameUserController.getGameUser(null, {
                id: participant._id,
            });
            const nextGameUserIndex = gameUserIndex + 1;
            const prevGameUserIndex = gameUserIndex - 1;
            if (gameUserIndex === 0) {
                gameUser.namingUser = participants[room.participants.length - 1];
                gameUser.seterUser = participants[nextGameUserIndex];
            }
            else if (gameUserIndex === participants.length - 1) {
                gameUser.namingUser = participants[prevGameUserIndex];
                gameUser.seterUser = participants[0];
            }
            else {
                gameUser.namingUser = participants[prevGameUserIndex];
                gameUser.seterUser = participants[nextGameUserIndex];
            }
            participant.namingUser = gameUser.namingUser;
            participant.seterUser = gameUser.seterUser;
            yield gameUser.save();
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
});
exports.generateGuessQueue = generateGuessQueue;
