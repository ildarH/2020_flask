import random
import json

MIN_NUMBER = 10
MAX_NUMBER = 99


def random_answer():
    # supernatural precognitions
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
    # calculate statictic for extrasense
    valid_answers = 0
    for answers in answers_list['answers']:
        if answers['is_true']:
            valid_answers += 1

    total_answers = len(answers_list['answers'])

    score = valid_answers / total_answers

    statistic_json = {
        "id": answers_list['id'],
        "total_answers": total_answers,
        "true_answers": valid_answers,
        "score": score
    }
    return statistic_json


def get_answer(imported_json, current_player, correct_answers_list):
    if len(imported_json[current_player]['answers']) != 0:
        last_answer = int(imported_json[current_player]['answers'][-1]['value'])
        if len(correct_answers_list) < 2:
            value = random_answer()
        elif last_answer % 2 == 0:
            value = answer_type_1(correct_answers_list)
        else:   
            value = answer_type_2(correct_answers_list)
        if not value:
            return random_answer()
    return random_answer()


def validate_answer(imported_json, answer):
    players = imported_json
    for player in players:
        if player['answers'][-1]['value'] == answer:
            player['answers'][-1]['is_true'] = True
        else:
            player['answers'][-1]['is_true'] = False
    return imported_json


def get_number_of_players(imported_json):
    return len(imported_json)


def add_player(imported_json, players=2):
    existing_players = get_number_of_players(imported_json)
    if players > existing_players:
        for player in range(existing_players, players):
            imported_json.append({'id': player, 'answers': []})
        return imported_json


def del_player(imported_json, players):
    existing_players = get_number_of_players(imported_json)
    if existing_players > players >= 2:
        for player in range(existing_players, players, -1):
            del imported_json[-1]
        return imported_json


def add_answer(imported_json, correct_answers_list):
    for player in range(get_number_of_players(imported_json)):
        add_data = {'index': len(imported_json[player]['answers']), 'value': get_answer(imported_json, player, correct_answers_list), 'is_true': None}
        imported_json[player]['answers'].append(add_data)
    return imported_json


if __name__ == "__main__":

    secret_number = 55
    set_number_of_players = 5

    quiz = []
    correct_answers = []

    # add player
    add_player(quiz, set_number_of_players)

    # add answer
    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 54

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 59

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 80

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 21

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 99

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 34

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 31

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    secret_number = 62

    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    print(json.dumps(quiz, indent=2))

    print('all stats:')
    for player in range(get_number_of_players(quiz)):
        print(statistic(quiz[player]))

    print('correct_answers:')
    print(correct_answers)

    set_number_of_players = 3

    del_player(quiz, set_number_of_players)
    print(json.dumps(quiz, indent=2))
    print('all stats:')
    for player in range(get_number_of_players(quiz)):
        print(statistic(quiz[player]))

    set_number_of_players = 5
    add_player(quiz, set_number_of_players)
    
    add_answer(quiz, correct_answers)
    validate_answer(quiz, secret_number)
    correct_answers.append(secret_number)

    print(json.dumps(quiz, indent=2))
    print('all stats:')
    for player in range(get_number_of_players(quiz)):
        print(statistic(quiz[player]))

