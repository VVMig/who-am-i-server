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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameUserController = void 0;
const apollo_server_1 = require("apollo-server");
const faker_1 = __importDefault(require("faker"));
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const roomController_1 = require("./roomController");
exports.gameUserController = {
    createGameUser(_, { shareId, isAdmin }) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield roomController_1.roomController.getRoom(null, { shareId });
            const gameUser = yield models_1.GameUser.create({
                displayName: faker_1.default.name.firstName(),
                room,
                color: faker_1.default.internet.color(),
                isAdmin: isAdmin || false,
            });
            yield gameUser.save();
            return gameUser;
        });
    },
    getGameUser(_, { id }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.isValidObjectId(id)) {
                throw new apollo_server_1.UserInputError('Wrong user id');
            }
            const gameUser = yield models_1.GameUser.findById(id)
                .populate('room')
                .populate('namingUser')
                .populate('seterUser');
            if (!gameUser) {
                throw new apollo_server_1.UserInputError('Game user not found');
            }
            return gameUser;
        });
    },
    removeGameUser(_, { id }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield models_1.GameUser.findByIdAndDelete(id);
        });
    },
};
