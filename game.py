import random
import json
import sys

MIN_NUMBER = 10
MAX_NUMBER = 99


def random_answer():
    return random.randint(MIN_NUMBER, MAX_NUMBER)


def answer_type_1(correct_answers_list):
    last_answer = correct_answers_list[-1]
    if last_answer != MAX_NUMBER:
        if last_answer > 54:
            return (last_answer + MAX_NUMBER) // 2
        else:
            return (last_answer + MIN_NUMBER) // 2


def answer_type_2(correct_answers_list):
    value = random.choices(correct_answers_list)
    return value[0]


def statistic(answers_list):
    valid_answers = 0
    for answers in answers_list['answers']:
        if answers['is_true']:
            valid_answers += 1

    total_answers = len(answers_list['answers'])

    score = valid_answers / total_answers

    statistic_json = {
        'id': answers_list['id'],
        'total_answers': total_answers,
        'true_answers': valid_answers,
        'score': score
    }
    return statistic_json

def get_answer(player, correct_answers_list):
    return random_answer()


def validate_answer(imported_json, answer):
    for player in imported_json:
        if player['answers'][-1]['value'] == answer:
            player['answers'][-1]['is_true'] = True
        else:
            player['answers'][-1]['is_true'] = False
    return imported_json


def get_number_of_players(imported_json):
    return len(imported_json)


def add_answer(player, correct_answers_list):
    return {'value': get_answer(player, correct_answers_list), 'is_true': None}
