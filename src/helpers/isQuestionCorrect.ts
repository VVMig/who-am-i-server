import { IAnswer } from '../models';

export const isQuestionCorrect = (answers: IAnswer[]) => {
  const positiveAnswersCount = answers.filter((answer) => answer.value).length;
  const negativeAnswersCount = answers.filter((answer) => !answer.value).length;

  return negativeAnswersCount <= positiveAnswersCount;
};
