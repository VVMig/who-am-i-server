"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGameAuthCookie = void 0;
const CookiesType_1 = require("../CookiesType");
const cookieMaxAge = 360000;
const setGameAuthCookie = (res, gameUserId, roomShareId) => {
    res.cookie(CookiesType_1.CookiesType.GameAuth, JSON.stringify({
        gameUserId,
        roomShareId,
    }), {
        maxAge: cookieMaxAge,
        sameSite: 'none',
        secure: true,
    });
};
exports.setGameAuthCookie = setGameAuthCookie;
