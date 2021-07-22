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
exports.resolvers = void 0;
const controllers_1 = require("../controllers");
const helpers_1 = require("../helpers");
const apollo_server_1 = require("apollo-server");
const CookiesType_1 = require("../CookiesType");
const PubSubEnum_1 = require("./PubSubEnum");
const GameStage_1 = require("../GameStage");
const pubsub = new apollo_server_1.PubSub();
const correctAnswersForNextStep = 3;
exports.resolvers = {
    Query: {
        getGameUser: controllers_1.gameUserController.getGameUser,
        getRoom: controllers_1.roomController.getRoom,
        getRangeParticipants() {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    min: controllers_1.minParticipantsLimit,
                    max: controllers_1.maxParticipantsLimit,
                    defaultValue: controllers_1.defaultParticipantsValue,
                };
            });
        },
        isRoomExist(_, __, { cookies, res }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    return false;
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                try {
                    yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                    yield controllers_1.gameUserController.getGameUser(_, { id: gameUserId });
                }
                catch (error) {
                    res.clearCookie(CookiesType_1.CookiesType.GameAuth);
                    return false;
                }
                return true;
            });
        },
    },
    Mutation: {
        sendAnswer(_, { answer, isGuessed }, { cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                if (answer === undefined) {
                    throw new apollo_server_1.UserInputError('You can not send empty answer');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const participants = room.participants;
                const gameUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                const questionUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: room.question.from,
                });
                const questionUserIndex = participants.findIndex((participant) => participant.id === questionUser.id);
                if (`${gameUser.id}` === `${room.question.from}`) {
                    throw new apollo_server_1.UserInputError('You can not answer on your question');
                }
                room.answers.push({
                    id: gameUser.id,
                    value: answer,
                    isGuessed,
                });
                if (room.answers.length === participants.length - 1) {
                    if (helpers_1.checkPlayerFinish(room)) {
                        questionUser.isFinish = true;
                        helpers_1.nextStep(room, questionUser);
                    }
                    else if (helpers_1.isQuestionCorrect(room.answers)) {
                        questionUser.correctAnswers += 1;
                        if (questionUser.correctAnswers === correctAnswersForNextStep) {
                            helpers_1.nextStep(room, questionUser);
                        }
                    }
                    else {
                        helpers_1.nextStep(room, questionUser);
                    }
                    room.answers = [];
                    room.question = null;
                    room.participants[questionUserIndex] = questionUser;
                }
                if (helpers_1.checkGameFinish(room)) {
                    yield helpers_1.restoreRoom(room);
                    pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                        gameUserUpdate: room,
                    });
                    return room;
                }
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                    gameUserUpdate: room,
                });
                yield questionUser.save();
                yield room.save();
                return room;
            });
        },
        sendQuestion(_, { question }, { cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                if (!question.trim()) {
                    throw new apollo_server_1.UserInputError('You can not send empty question');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const participants = room.participants;
                const gameUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                const gameUserIndex = participants.findIndex((participant) => participant.id === gameUser.id);
                if (room.step % participants.length !== gameUserIndex) {
                    throw new apollo_server_1.UserInputError('Now is not your turn to ask a question');
                }
                room.question = {
                    from: gameUser.id,
                    value: question,
                };
                yield room.save();
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                    gameUserUpdate: room,
                });
                return room;
            });
        },
        nameStageNext(_, __, { cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const adminUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                if (!adminUser.isAdmin) {
                    throw new apollo_server_1.ForbiddenError('You do not have permission to start game');
                }
                if (room.participants.length !== room.maxParticipants) {
                    throw new apollo_server_1.UserInputError('Wait all players');
                }
                room.gameStage = GameStage_1.GameStage.PLAY_STAGE;
                yield room.save();
                pubsub.publish(PubSubEnum_1.PubSubEnum.ROOM_STAGE, {
                    roomStage: room,
                });
                return room;
            });
        },
        guessName(_, { id, name }, { cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const gameUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                const namingUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id,
                });
                if (gameUser.namingUser.id !== namingUser.id) {
                    throw new apollo_server_1.UserInputError('You do not have permission to name this user');
                }
                namingUser.guessName = name;
                yield namingUser.save();
                const namingUserIndex = room.participants.findIndex((participant) => participant.id === namingUser.id);
                room.participants[namingUserIndex].guessName = name;
                yield namingUser.save();
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                    gameUserUpdate: room,
                });
                return room;
            });
        },
        waitStageNext(_, __, { cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const adminUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                if (!adminUser.isAdmin) {
                    throw new apollo_server_1.ForbiddenError('You do not have permission to start game');
                }
                if (room.participants.length !== room.maxParticipants) {
                    throw new apollo_server_1.UserInputError('Wait all players');
                }
                room.gameStage = GameStage_1.GameStage.NAME_STAGE;
                yield helpers_1.generateGuessQueue(room);
                yield room.save();
                pubsub.publish(PubSubEnum_1.PubSubEnum.ROOM_STAGE, {
                    roomStage: room,
                });
                return room;
            });
        },
        kickPlayer(_, { id }, { cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const adminUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                if (!adminUser.isAdmin) {
                    throw new apollo_server_1.ForbiddenError('You do not have permission to kick players');
                }
                const kickCandidate = yield controllers_1.gameUserController.getGameUser(_, { id });
                yield controllers_1.gameUserController.removeGameUser(_, { id });
                room.participants = room.participants.filter((participant) => participant.id !== kickCandidate.id);
                yield room.save();
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_KICKED, {
                    kickedGameUser: id,
                });
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                    gameUserUpdate: room,
                });
                return room;
            });
        },
        createRoom(_, { maxParticipants }, { res }) {
            return __awaiter(this, void 0, void 0, function* () {
                const room = yield controllers_1.roomController.createRoom(_, { maxParticipants });
                const gameUser = yield controllers_1.gameUserController.createGameUser(_, {
                    shareId: room.shareId,
                    isAdmin: true,
                });
                room.participants.push(gameUser);
                yield room.save();
                helpers_1.setGameAuthCookie(res, gameUser.id, room.shareId);
                return room;
            });
        },
        createGameUser: controllers_1.gameUserController.createGameUser,
        joinRoom(_, { shareId }, { res }) {
            return __awaiter(this, void 0, void 0, function* () {
                const room = yield controllers_1.roomController.getRoom(_, { shareId });
                if (room.participants.length >= controllers_1.maxParticipantsLimit) {
                    throw new apollo_server_1.UserInputError('Room is full');
                }
                const gameUser = yield controllers_1.gameUserController.createGameUser(_, { shareId });
                room.participants.push(gameUser);
                yield room.save();
                helpers_1.setGameAuthCookie(res, gameUser.id, room.shareId);
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                    gameUserUpdate: room,
                });
                return room;
            });
        },
        reconnectRoom(_, __, { cookies, res }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You do not have any game session');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const gameUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                if (!room || !gameUser) {
                    res.clearCookie(CookiesType_1.CookiesType.GameAuth);
                    throw new apollo_server_1.UserInputError('Wrong data');
                }
                if (!room.participants.find((participant) => participant.id === gameUser.id)) {
                    res.clearCookie(CookiesType_1.CookiesType.GameAuth);
                    throw new apollo_server_1.UserInputError('You are not a member of this room');
                }
                return room;
            });
        },
        leaveRoom(_, __, { res, cookies }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!cookies[CookiesType_1.CookiesType.GameAuth]) {
                    throw new apollo_server_1.UserInputError('You have already left this room');
                }
                const { roomShareId, gameUserId } = JSON.parse(cookies[CookiesType_1.CookiesType.GameAuth]);
                const room = yield controllers_1.roomController.getRoom(_, { shareId: roomShareId });
                const gameUser = yield controllers_1.gameUserController.getGameUser(_, {
                    id: gameUserId,
                });
                if (!room || !gameUser) {
                    res.clearCookie(CookiesType_1.CookiesType.GameAuth);
                    throw new apollo_server_1.UserInputError('Wrong data');
                }
                room.participants = room.participants.filter((participant) => participant.id !== gameUser.id);
                if (!room.participants.length) {
                    yield controllers_1.roomController.removeRoom(_, { shareId: room.shareId });
                }
                else {
                    const newAdmin = yield controllers_1.gameUserController.getGameUser(_, {
                        id: room.participants[0].id,
                    });
                    newAdmin.isAdmin = true;
                    yield newAdmin.save();
                    room.participants[0].isAdmin = true;
                    yield room.save();
                }
                yield controllers_1.gameUserController.removeGameUser(_, { id: gameUser.id });
                pubsub.publish(PubSubEnum_1.PubSubEnum.USER_UPDATE, {
                    gameUserUpdate: room,
                });
                res.clearCookie(CookiesType_1.CookiesType.GameAuth);
                return 'Successfully exited';
            });
        },
    },
    Subscription: {
        gameUserUpdate: {
            subscribe: apollo_server_1.withFilter(() => pubsub.asyncIterator(PubSubEnum_1.PubSubEnum.USER_UPDATE), ({ gameUserUpdate }, { shareId }) => {
                return gameUserUpdate.shareId === shareId;
            }),
        },
        kickedGameUser: {
            subscribe: apollo_server_1.withFilter(() => pubsub.asyncIterator(PubSubEnum_1.PubSubEnum.USER_KICKED), ({ kickedGameUser }, { id }) => {
                return kickedGameUser === id;
            }),
        },
        roomStage: {
            subscribe: apollo_server_1.withFilter(() => pubsub.asyncIterator(PubSubEnum_1.PubSubEnum.ROOM_STAGE), ({ roomStage }, { shareId }) => {
                return roomStage.shareId === shareId;
            }),
        },
    },
};
