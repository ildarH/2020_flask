import json
import random

MIN_NUMBER = 10
MAX_NUMBER = 99


class Player:
    """
    Class contain methods to generate numbers,
    validate User's numbers and get json formatted output.
    """
    minNumber = MIN_NUMBER
    maxNumber = MAX_NUMBER
    correctAnswers = []

    def __init__(self, id_, answers=None, statistic=None):
        self.id = id_
        if answers is not None and statistic is not None:
            self.answers = answers
            self.statistic = statistic
        else:
            self.answers = []
            self.statistic = {
                'totalAnswers': 0,
                'trueAnswers': 0,
                'score': 0
            }

    def getAnswer(self):
        index = len(self.answers)
        answer = random.randint(self.minNumber, self.maxNumber)
        self.statistic['totalAnswers'] += 1
        if len(self.correctAnswers) and self.id > 4:
            answer = random.choice(self.correctAnswers)
        self.answers.append({'index': index, 'value': answer, 'isTrue': None})
        return self.answers

    def validateAnswer(self, correctAnswer):
        self.correctAnswers.append(correctAnswer)
        if self.answers[-1]["value"] == correctAnswer:
            self.answers[-1]["isTrue"] = True
        else:
            self.answers[-1]["isTrue"] = False

        self.statistic = {
            'totalAnswers': len(self.answers),
            'trueAnswers': sum(1 for answer in self.answers
                               if answer['isTrue'] == 1),
            'score': sum(1 for answer in self.answers
                         if answer['isTrue'] == 1) / len(self.answers)
        }

    def getJson(self):
        return {
            'id_': self.id,
            'answers': self.answers,
            'statistic': self.statistic
        }

    def __repr__(self):
        return f"id_: {self.id}, answers: {self.answers}, \
            statistic: {self.statistic}"
