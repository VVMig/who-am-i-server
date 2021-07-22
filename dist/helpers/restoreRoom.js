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
exports.restoreRoom = void 0;
const controllers_1 = require("../controllers");
const GameStage_1 = require("../GameStage");
const restoreRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    room.question = null;
    room.answers = [];
    room.gameStage = GameStage_1.GameStage.WAIT_STAGE;
    room.step = 0;
    try {
        for (var _b = __asyncValues(room.participants), _c; _c = yield _b.next(), !_c.done;) {
            const participant = _c.value;
            const gameUser = yield controllers_1.gameUserController.getGameUser(null, {
                id: participant.id,
            });
            gameUser.guessName = null;
            gameUser.isFinish = false;
            gameUser.namingUser = null;
            gameUser.seterUser = null;
            gameUser.correctAnswers = 0;
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
    yield room.save();
});
exports.restoreRoom = restoreRoom;
