import os
from datetime import timedelta
from time import ctime
from uuid import uuid4

import pylibmc
from flask import (Flask, jsonify, redirect,
                   render_template, request,
                   session, url_for)

from game import game

SESSION_TYPE = 'memcached'


mc = pylibmc.Client(["127.0.0.1"], binary=True,
                    behaviors={"tcp_nodelay": False,
                    "ketama": True})

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)


@app.route('/', methods=['GET', 'POST'])
def index():

    players = []
    gameJson = []
    data = None

    if 'user' not in session:
        user = str(uuid4())
        session['user'] = user
        mc[user] = []

    else:
        user = session['user']
        players = mc[user]
        gameObj = game(players)
        mc[user] = gameObj[0]
        gameJson = gameObj[1]

    if request.method == 'POST':
        data = request.get_json(force=False, silent=True)
        gameObj = game(players, **data)
        mc[user] = gameObj[0]
        gameJson = gameObj[1]
        return jsonify(gameJson)

    return render_template('index.html', data=gameJson, time=ctime())


@app.route('/restart', methods=['POST'])
def restart():
    if 'user' in session:
        user = session['user']
        session.pop('user')
        del mc[user]
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run()
