import { AnswerEnum } from '../AnswerEnum';
import { IAnswer } from '../models';

export const countAnswers = (answers: IAnswer[]) => {
  let yesAmount = 0;
  let noAmount = 0;

  answers.forEach((answer) =>
    answer.answer === AnswerEnum.Yes ? ++yesAmount : ++noAmount
  );

  if (noAmount > yesAmount) {
    return AnswerEnum.No;
  }

  return AnswerEnum.Yes;
};
