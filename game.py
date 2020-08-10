from player import Player


def game(players, **kwargs):
    """Interface for Players class interaction.

    Args:
        players (list): list of Players instances.
        commands (dict): game commands.

    Returns:
        players: list of Players instances.
        gameJson: json contains all game info.
    """
    gameStart = int(kwargs['gameStart']) if kwargs else 0
    countPlayers = int(kwargs['countPlayers']) if kwargs else 0
    correctAnswer = int(kwargs['correctAnswer']) if kwargs else 0
    gameJson = []

    def _addPlayer(players, gameJson=None):
        """Adds Player's instance to list."""
        for player in range(len(players), countPlayers):
            answers = gameJson[player]["answers"] if gameJson else None
            statistic = gameJson[player]["statistic"] if gameJson else None
            players.append(Player(player, answers, statistic))

    def _delPlayer(players):
        """Delete Player's instance from list."""
        for player in range(len(players) - countPlayers):
            players.pop()

    def _start(players):
        """Get Player's answers json"""
        for player in range(len(players)):
            players[player].getAnswer()

    def _validate(players, correctAnswer):
        """Validate User's number and set the sign in json"""
        for player in range(len(players)):
            players[player].validateAnswer(correctAnswer)

    if kwargs:
        if countPlayers > len(players):
            _addPlayer(players, gameJson)
        elif countPlayers < len(players):
            _delPlayer(players)

    if gameStart:
        _start(players)

    if correctAnswer:
        _validate(players, correctAnswer)

    for player in range(len(players)):
        gameJson.append(players[player].getJson())

    return players, gameJson
