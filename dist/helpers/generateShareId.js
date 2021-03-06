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
exports.generateShareId = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
const randomstring_1 = __importDefault(require("randomstring"));
const models_1 = require("../models");
const generateShareId = () => __awaiter(void 0, void 0, void 0, function* () {
    let genedId = randomstring_1.default.generate({ length: 5 });
    let room = yield models_1.Room.findOne({ shareId: genedId });
    while (room) {
        genedId = randomstring_1.default.generate({ length: 5 });
        room = yield models_1.Room.findOne({ shareId: genedId });
    }
    return genedId;
});
exports.generateShareId = generateShareId;
