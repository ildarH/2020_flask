from flask import Flask, request, render_template, jsonify, session, g
from datetime import timedelta
from calc import *
from uuid import uuid4
from jsonmerge import merge
from time import ctime


app = Flask(__name__)
# app.config['SECRET_KEY'] = 'ODP-4--VuNKv9HfgChKxvQ'
# app.permanent_session_lifetime = timedelta(minutes=20)

game_json = []
correct_answers = []
error_msg = []
statistics_list = {"statistics_list" : []}

@app.route('/', methods=["GET", "POST"])
def index():
    data = jsonify(game_json)
    print("/")
    if request.method == 'POST':
        return jsonify(game_json, statistics_list, correct_answers)
    return render_template ('index.html', data=data, time= ctime())


@app.route('/gamestart', methods = ['POST'])
def gamestart():
    # session['number']  = str(uuid4())
    # session['number']  = 1
    # print ('session info')
    # print (session)
    # work in session
    # if session.get('number', None) is not None:
    #     s_id = session.get('number')
    #     return s_id

    # session(app)

    # session['number'] = str(uuid4())

    # g.user = None
    # user = session
    # if user in session:
    #     print ("user active")

    # flask.session['uid'] = uuid.uuid4()
    # del flask.session['uid']

    default_players = 2
    players = default_players

    add_player(game_json, default_players)

    if request.method == 'POST':
        game_start = request.form.get('game_start')
        players = int(request.form.get('count_players'))
        print('players: ' + str(players))

        if players > get_number_of_players(game_json):
            add_player(game_json, players)
        elif players < get_number_of_players(game_json):
            del_player(game_json, players)

        if game_start:
            add_answer(game_json, correct_answers)
        else:
            error_msg.append("game start error")
        game_start = 0
        return jsonify(game_json, statistics_list, correct_answers)

    return jsonify({'error': error_msg }).data

@app.route('/gamevalidate', methods = ['POST'])
def gamevalidate():
    if request.method == 'POST':
        correct_answer = request.form.get('input_correct_answer')
        # correct_answer = request.get_json()
        print("correct_answer:")
        print(correct_answer)
        if correct_answer:
            correct_answer = int(correct_answer)
            validate_answer(game_json, correct_answer)
            correct_answers.append(correct_answer)

            if 'statistics_list' in statistics_list:
                statistics_list['statistics_list'].clear()

            for player in range(get_number_of_players(game_json)):
                statistics_list['statistics_list'].append(statistic(game_json[player]))

            return jsonify(game_json, statistics_list, correct_answers)
        else:
            error_msg.append("game validate error")

    return jsonify({'error': error_msg }).data

# @app.route('/gamecontinue', methods = ['POST'])
# def gamecontinue()
#     re

if __name__ == '__main__':
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)
