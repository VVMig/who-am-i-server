"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQuestionCorrect = void 0;
const isQuestionCorrect = (answers) => {
    const positiveAnswersCount = answers.filter((answer) => answer.value).length;
    const negativeAnswersCount = answers.filter((answer) => !answer.value).length;
    return negativeAnswersCount <= positiveAnswersCount;
};
exports.isQuestionCorrect = isQuestionCorrect;
