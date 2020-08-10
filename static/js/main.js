const MINPLAYERS = 2,
      MAXPLAYERS = 5;
let avatar = ["🐴", "🐵", "🐸",
              "🐹", "🦁", "🐱‍👤",
              "🤖", "🦄", "🐲",
              "🧞‍♂️", "💀", "🦉",
              "🐦", "🐞", "🐌"],
    dataType = {
        content: "[data-type='content']",
        correctAnswers: "[data-type='correct-answers']",
        correctList: "[data-type='correctList']",
        playerCard: "[data-type='playerCard']",
        statTotal: "[data-stat-total]",
        statTrue: "[data-stat-true]",
        statScore: "[data-stat-score]",
        valuesList: "[data-type='valuesList']",
    },
    players = [];
let btnStart = $("#btnStartGame"),
    inputCorrectAnswer = $("#inputCorrectAnswer"),
    btnCorrectAnswer = $("#btnCorrectAnswer"),
    btnAddPlayer = $("#btnAddPlayer"),
    btnDelPlayer = $("#btnDelPlayer"),
    btnRestart = $(".btnRestart"),
    errorsField = $("#errors"),
    dataField = $("#data"),
    templatePlayer = $("#player").html();

$(document).ready(function() {
    let gameStartVal = 0,
        countPlayersVal = 0,
        correctAnswerVal = 0,
        dataToServer = {
            'gameStart': gameStartVal,
            'countPlayers': countPlayersVal,
            'correctAnswer': correctAnswerVal
        };
    let game = {
        addPlayer: function(data) {
            if (typeof(arguments[0]) != "undefined") {
                if (!isEmpty(data)) {
                    for (player = 0; player < data.length; player++) {
                        let newPlayer = new Player(player,
                                                   data[player].answers,
                                                   data[player].statistic,
                                                   avatar[player])
                        players.push(newPlayer);
                    }
                } else {
                    for (player = 0; player < MINPLAYERS; player++) {
                        let newPlayer = new Player(player)
                        players.push(newPlayer);
                    }
                }
            } else {
                let newPlayer = new Player(game.countPlayers())
                players.push(newPlayer);
            }
            dataToServer.gameStart = 0;
            dataToServer.countPlayers = game.countPlayers();
            dataToServer.correctAnswer = 0;
            getData("/", dataToServer).done(function(data) { game.setData(data) })
                                      .fail(function() { errorsField.text("add player game error: please reload") })
        },
        delPlayer: function() {
            players.pop();
            dataToServer.gameStart = 0;
            dataToServer.countPlayers = game.countPlayers();
            dataToServer.correctAnswer = 0;
            getData("/", dataToServer).done(function(data) { game.setData(data) })
                                      .fail(function() { errorsField.text("delete player error: please reload") });
        },
        countPlayers: function() {
            return players.length
        },
        clickHandlers: function() {
            btnStart.click(function() { game.startGame() });
            inputCorrectAnswer.keyup(function() {
                let isFormValid = false;
                isFormValid = game.validateForm();
                inputCorrectAnswer.prop("disabled", isFormValid);
                btnCorrectAnswer.prop("disabled", !isFormValid);
                btnCorrectAnswer.not(":disabled").focus();
            });
            btnCorrectAnswer.click(function() { game.validateGame() });
            btnDelPlayer.click(function() {
                if (game.countPlayers() > MINPLAYERS && game.countPlayers() <= MAXPLAYERS) {
                    game.delPlayer()
                }
            });
            btnAddPlayer.click(function() {
                if (game.countPlayers() < MAXPLAYERS) {
                    game.addPlayer()
                }
            });
            btnRestart.click(function() { game.restart() });
        },
        startGame: function() {
            dataToServer.gameStart = 1;
            dataToServer.countPlayers = this.countPlayers();
            dataToServer.correctAnswer = 0;
            getData("/", dataToServer).done(function(data) { game.setData(data); })
                                      .fail(function() { errorsField.text("start game error: please reload") })
        },
        validateForm: function() {
            let isFormValid = false,
                correctAnswerVal = parseInt(inputCorrectAnswer.val());
            if (correctAnswerVal >= 10 && correctAnswerVal < 100) {
                isFormValid = true;
            }
            return isFormValid;
        },
        validateGame: function() {
            let correctAnswerValue = inputCorrectAnswer.val();
            inputCorrectAnswer.val("");
            correctValuesStorage.value = correctAnswerValue;
            dataToServer.gameStart = 0;
            dataToServer.countPlayers = game.countPlayers();
            dataToServer.correctAnswer = correctAnswerValue;
            getData("/", dataToServer)
                .done(function(data) { game.setData(data) })
                .fail(function() { errorsField.text("validate game error: please reload") });
        },
        setInputs: function() {
            let startButtonNotActive = false,
                inputFieldNotActive = true,
                sendButtonNotActive = true;
            let answersIsAvailable = !isEmpty(players[players.length - 1].answers)
            if (answersIsAvailable) {
                let answersLength = players[players.length - 1].answers.length,
                    lastAnswerIsVerified = players[players.length - 1].answers[answersLength - 1].isTrue == null ? false : true;
                startButtonNotActive = !lastAnswerIsVerified;
                inputFieldNotActive = lastAnswerIsVerified;
                sendButtonNotActive = startButtonNotActive != inputFieldNotActive;
            }
            let addPlayerButtonNotActive = (players.length < MAXPLAYERS) && !startButtonNotActive ? false : true,
                delPlayerButtonNotActive = (players.length > MINPLAYERS) && !startButtonNotActive ? false : true;
            btnStart.prop("disabled", startButtonNotActive);
            inputCorrectAnswer.prop("disabled", inputFieldNotActive);
            btnCorrectAnswer.prop("disabled", sendButtonNotActive);
            btnAddPlayer.prop("disabled", addPlayerButtonNotActive);
            btnDelPlayer.prop("disabled", delPlayerButtonNotActive);
            btnStart.not(":disabled").focus();
            inputCorrectAnswer.not(":disabled").focus();
        },
        setData: function(data) {
            checkNewGame(data);
            for (let player = 0; player < players.length; player++) {
                for (let answer = 0; answer < data[player].answers.length; answer++) {
                    let index = data[player].answers[answer].index,
                        value = data[player].answers[answer].value,
                        isTrue = data[player].answers[answer].isTrue;
                    players[player].addValue(index, value, isTrue);
                }
                players[player].statTotalAnswers = data[player].statistic.totalAnswers || 0;
                players[player].statTrueAnswers = data[player].statistic.trueAnswers || 0;
                players[player].statScore = data[player].statistic.score || 0;
            }
            game.setInputs();
            renderCards(players);
        },
        restart: function() {
            sessionStorage.clear();
            getData('restart').done(function(data) { game.setData(data) })
                              .fail(function() { errorsField.text("restart server error") });
            window.location.reload(false);
        },
        init: function() {
            let data = game.loadStorage();
            game.addPlayer(data);
            correctValuesStorage.init(data);
            game.clickHandlers();
            game.setInputs();
        },
        loadStorage: function() {
            let dataFromServer = dataField.data("fromServer");
            dataField.attr("data-from-server", null);
            if (sessionStorage.avatar) { avatar = JSON.parse(sessionStorage.avatar); }
            else {
                shuffleArray(avatar);
                sessionStorage.setItem("avatar", JSON.stringify(avatar));
            }
            if (!isEmpty(dataFromServer)) { return dataFromServer }
            correctValuesStorage.clear();
            return []
        },
        checkNewGame: function(data) {
            if (!isEmpty(data)) {
                if (data[0].answers.length < players[0].answers.length) {
                    for (player = 0; player < players.length; player++) {
                        players[player].answers = [];
                    }
                }
            }
        }
    };
    game.init();
});

class Player {
    constructor(id_, answers, statistic, icon) {
        this.id_ = id_;
        this.answers = answers || [];
        this.statistic = statistic || {
            'totalAnswers': 0,
            'trueAnswers': 0,
            'score': 0
        };
        this.icon = icon || avatar[this.id_];
    }
    set statTotalAnswers(totalAnswers) { this.statistic.totalAnswers = totalAnswers; }
    get statTotalAnswers() { return this.statistic.totalAnswers; }

    set statTrueAnswers(trueAnswers) { this.statistic.trueAnswers = trueAnswers; }
    get statTrueAnswers() { return this.statistic.trueAnswers; }

    set statScore(score) { this.statistic.score = score; }
    get statScore() { return this.statistic.score; }

    addValue(index, value, valueIsTrue) {
        if (valueIsTrue == null && isEmpty(this.answers[index])) {
            this.answers.push({
                "index": index,
                "value": value,
                "isTrue": valueIsTrue
            });
        } else {
            this.answers[index].isTrue = valueIsTrue;
        }
    }
    toJSON() {
        let {id_, answers, statistic} = this;
        return {id_, answers, statistic};
    }
}

let correctValuesStorage = {
    values: [],
    get value() {
        if (sessionStorage.correctValues) {
            this.values = JSON.parse(sessionStorage.correctValues);
        }
        return this.values;
    },
    set value(value) {
        if (sessionStorage.correctValues) {
            this.values = JSON.parse(sessionStorage.correctValues);
        }
        this.values.push(parseInt(value));
        sessionStorage.setItem("correctValues", JSON.stringify(this.values));
        renderCorrectValues(value);
    },
    init: function(data) {
        if (sessionStorage.correctValues && !isEmpty(data)) {
            this.values = JSON.parse(sessionStorage.correctValues);
            renderCorrectValues();
        }
    },
    clear: function() {
        if (sessionStorage.correctValues) { sessionStorage.removeItem("correctValues") }
        this.values = [];
        renderCorrectValues();
    }
};

function checkNewGame(data) {
    if (!isEmpty(data)) {
        if (data[0].answers.length < players[0].answers.length) {
            for (player = 0; player < players.length; player++) {
                players[player].answers = [];
            }
        correctValuesStorage.clear();
        }
    }
}

function renderCorrectValues(correctValue=null){
    let field = $(dataType.correctAnswers);
    if (!sessionStorage.correctValues) { field.empty() }
    hideField(field);
    if (correctValue) { field.prepend("<li>" + correctValue + "</li>") } 
    else if(correctValuesStorage.values) {
        correctValuesStorage.values.forEach(element => field.prepend("<li>" + element + "</li>"));
    }
    if (correctValue || sessionStorage.correctValues) { showHiddenField(field) }
}

function renderCards(players) {
    let countCards = $(".card").length,
        countPlayers = players.length;
    if (countCards < countPlayers) {
        _addCard();
    } else if (countCards > countPlayers) {
        _deleteCard();
    }
    for (player = 0; player < players.length; player++) {
        let playerStr = "[data-player='" + players[player].id_ + "']";
        playerCard = $(playerStr + dataType.playerCard);
        _clearField(playerCard, players[player]);
        _setStat(playerCard, players[player]);
        _setAnswer(playerCard, players[player]);
    }

    function _clearField(playerCard) {
        let field = $(playerCard.find(dataType.correctList));
        hideField(field);
        playerCard.find(dataType.correctList).empty();
        field = $(playerCard.find(dataType.content));
        hideField(field);
        playerCard.find(dataType.valuesList).empty();
    }

    function _setStat(playerCard, player) {
        playerCard.find(dataType.statTotal).text(player.statistic.totalAnswers);
        playerCard.find(dataType.statTrue).text(player.statistic.trueAnswers);
        playerCard.find(dataType.statScore).text((player.statistic.score * 100).toFixed() + "%");
    }

    function _setAnswer(playerCard, player) {
        if (!isEmpty(player.answers)) {
            let field = $(playerCard.find(dataType.content));
            showHiddenField(field);
            field = $(playerCard.find(dataType.valuesList));
            showHiddenField(field);
            for (answer = 0; answer < player.answers.length; answer++) {
                let index = player.answers[answer].index,
                    value = player.answers[answer].value,
                    isTrue = player.answers[answer].isTrue;
                _addAnswerElement(field, index, value, isTrue);
                if (isTrue) {
                    _addCorrectAnswerElement(playerCard, value);
                }
            }
            _setClass();
        }
    }

    function _addAnswerElement(field, index, value, isTrue) {
        field.find("li:first").removeClass("lastElement");
        field.prepend("<li>" + value + "</li>");
        field.find("li:first").addClass("lastElement")
                              .data({
                                     "index" : index,
                                     "value" : value
                              })
                              .attr({
                                     "data-index" : index,
                                     "data-value" : value
                              });
        if (isTrue) {
            field.find("li:first").data("valueIsTrue", true).attr("data-value-is-true", true);
        } else if (isTrue == false) {
            field.find("li:first").data("valueIsTrue", false).attr("data-value-is-true", false);
        }
    }

    function _setClass() {
        let dataValueIsTrueElements = $("[data-value-is-true='true']"),
            dataValueIsFalseElements = $("[data-value-is-true='false']");
        dataValueIsTrueElements.addClass("correctElement");
        dataValueIsFalseElements.addClass("wrongElement");
    }

    function _addCorrectAnswerElement(playerCard, value) {
        let field = $(playerCard.find(dataType.correctList));
        showHiddenField(field);
        field.prepend("<li>" + value + "</li>");
        field.find("li:first").addClass("correctElement");
    }

    function _addCard(){
        for (player = $(".card").length; player < players.length; player++) {
            let playerTmp = $(templatePlayer);
            $(playerTmp).data("player", players[player].id_).attr("data-player", players[player].id_);
            $(playerTmp).find(".avatar").html(players[player].icon);
            $(".cards").append(playerTmp);
        }
    }
    function _deleteCard() {
        let playerStr = "[data-player='" + players.length + "']",
            playerCard = $(playerStr + dataType.playerCard);
        playerCard.remove();
    }
}

function showHiddenField(field) {
    let header = field.prev("p");
    field.show();
    header.show();
}

function hideField(field) {
    let header = field.prev("p");
    field.hide();
    header.hide();
}

function isEmpty(obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
}

function hasKeySetTo(obj, key, value) {
    return obj.hasOwnProperty(key) && obj[key] == value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getData(url, data) {
    return ajaxCall(url, data);
}

function ajaxCall(urlParam, dataToServer) {
    ajaxResponse = $.ajax({
        url: urlParam,
        data: JSON.stringify(dataToServer, null, "\t"),
        type: "POST",
        dataType: "json",
        contentType: "application/json;charset=UTF-8",
        xhrFields: {
            withCredentials: true,
        },
    });
    return ajaxResponse;
}