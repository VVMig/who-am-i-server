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
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = exports.defaultParticipantsValue = exports.minParticipantsLimit = exports.maxParticipantsLimit = void 0;
const apollo_server_1 = require("apollo-server");
const helpers_1 = require("../helpers");
const models_1 = require("../models");
exports.maxParticipantsLimit = 8;
exports.minParticipantsLimit = 2;
exports.defaultParticipantsValue = Math.round((exports.maxParticipantsLimit + exports.minParticipantsLimit) / 2);
exports.roomController = {
    getRoom(_, { shareId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield models_1.Room.findOne({ shareId }).populate({
                path: 'participants',
                model: 'GameUser',
                populate: [
                    {
                        path: 'namingUser',
                        model: 'GameUser',
                    },
                    {
                        path: 'seterUser',
                        model: 'GameUser',
                    },
                ],
            });
            if (!room) {
                throw new apollo_server_1.UserInputError('Room not found');
            }
            return room;
        });
    },
    createRoom(_, { maxParticipants = exports.defaultParticipantsValue }) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxParticipantsNum = maxParticipants;
            if (maxParticipantsNum < exports.minParticipantsLimit ||
                maxParticipantsNum > exports.maxParticipantsLimit) {
                throw new apollo_server_1.UserInputError('The number of participants must not exceed 8 and cannot be less than 2');
            }
            const shareId = yield helpers_1.generateShareId();
            const room = yield models_1.Room.create({
                shareId,
                maxParticipants: maxParticipants,
            });
            return room;
        });
    },
    removeRoom(_, { shareId }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield models_1.Room.deleteOne({ shareId });
        });
    },
};
