from flask import Flask, request, render_template, jsonify, session, redirect, url_for
from datetime import timedelta
from game import add_answer, statistic, validate_answer
from uuid import uuid4
from time import ctime
import os
import json


app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)


@app.route('/', methods=['GET', 'POST'])
def index():

    game_json = []

    if 'user' not in session:
        user = str(uuid4())
        session['user'] = user
        session.modified = True

    data = jsonify(game_json)

    return render_template ('index.html', data=data, time=ctime())


@app.route('/startgame', methods = ['POST'])
def startgame():

    if 'user' not in session:
        return redirect(url_for ('index'))

    default_players = 2
    players = default_players
    correct_answers = []
    game_json = {'gameJson' : []}
    error_msg = []

    if request.method == 'POST' and game_json is not None:
        game_start = request.form.get('gameStart')
        players = int(request.form.get('countPlayers'))

        if game_start:
            for player in range(players):
                game_json['gameJson'].append({'id' : player, 'answers' : []})
                add = add_answer(players, correct_answers)
                game_json['gameJson'][player]['answers'].append(add)
        else:
            error_msg.append('game start error')
        game_start = 0

        return jsonify(game_json)

    error_msg.append('start game')
    return jsonify({'Server error: ': error_msg }).data

@app.route('/validategame', methods = ['POST'])
def validategame():

    if 'user' not in session:
        return redirect(url_for ('index'))

    correct_answers = []
    statistics_list = []
    error_msg = []

    if request.method == 'POST':
        correct_answer = request.form.get('inputCorrectAnswer')
        game_json = json.loads(request.form.get('gameJson'))

        if correct_answer:
            correct_answer = int(correct_answer)
            validate_answer(game_json, correct_answer)
            correct_answers.append(correct_answer)
            for player in game_json:
                statistics_list.append(statistic(player))

            data = {'gameJson' : game_json,
                    'statJson' : statistics_list}

            return jsonify(data)
        else:
            error_msg.append('game validate error')

    return jsonify({'Server error: ': error_msg }).data

@app.route('/restartgame', methods = ['GET'])
def restartgame():
    if request.method == 'GET':
        if 'user' in session:
            session.pop('user')
            session.modified = True
    return redirect(url_for ('index'))

if __name__ == '__main__':
    app.run()
