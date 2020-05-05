$(document).ready(function() {

    let urlParamStart               = "/startgame",
        urlParamGameValidate        = "/validategame";
    let gameStartVal                = 0,
        countPlayersVal             = 0,
        correctAnswerVal            = 0,
        gameJson                    = 0,
        storageGame                 = {},
        storageStat                 = {},
        storageCorrectValues        = [],
        MINPLAYERS                  = 2,
        MAXPLAYERS                  = 5,
        DELAY                       = 200;
    let dataToServer                = {
            "gameStart"             : gameStartVal,
            "countPlayers"          : countPlayersVal,
            "inputCorrectAnswer"    : correctAnswerVal,
            "gameJson"              : gameJson
        };
    let avatar                      =  ["🐴", "🐵", "🐸", "🐹", "🦁",
                                        "🐱‍👤", "🤖", "🦄", "🐲", "🧞‍♂️",
                                        "💀", "🦉", "🐦", "🐞", "🐌"];
    let dataType                    = {
                content             : "[data-type='content']",
                correctAnswers      : "[data-type='correct-answers']",
                correctList         : "[data-type='correctList']",
                close               : "[data-type='btn_close']",
                playerCard          : "[data-type='playerCard']",
                statistic           : "[data-type='statistic']",
                statTotal           : "[data-stat-total]",
                statTrue            : "[data-stat-true]",
                statScore           : "[data-stat-score]",
                index               : "[data-index='",
                valueIsTrue         : "[data-value-is-true']",
                value               : "[data-value']",
                valuesList          : "[data-type='valuesList']",
                player              : "[data-player='"
        }
    let templatePlayer = $("#player").html();
    let game = {
        addPlayer: function(rPlayerNum) {
            let countPlayersVal = game.countPlayers(),
                rPlayerTmp = $(templatePlayer);
            if (rPlayerNum > countPlayersVal) {
                $(rPlayerTmp).data("player", rPlayerNum).attr("data-player", rPlayerNum);
                $(rPlayerTmp).find(".avatar").html(avatar[rPlayerNum-1]);
                $(".cards").append(rPlayerTmp);
            }
        },
        ajaxCall(urlParam, dataToServer) {
            ajaxResponse = $.ajax({
                url     : urlParam,
                data    : dataToServer,
                type    : "POST",
                dataType: "json"
            })
            return ajaxResponse;
        },
        clickHandlers: function() {
            $("#btnStartGame").click(function() {
                game.startGame();
                game.setInputs("data_received");
                $("#inputCorrectAnswer").val("");
            });
            $("#inputCorrectAnswer").keyup(function() {
                let isFormValid = false;
                isFormValid = game.validateForm();
                $("btnCorrectAnswer").toggleClass("disabled", isFormValid);
                if (isFormValid) {
                    game.setInputs("input");
                }
            });
            $("#btnCorrectAnswer").click(function() {
                game.validateGame();
                game.setInputs("start_or_continue");
                $("#inputCorrectAnswer").val("");
            });
            $(".card-front").click(function() {
                game.addPlayer();
            });
            $(".card-btn_close").click(function() {
                game.delPlayer();
            });
            $("#btnDelPlayer").click(function(){
                let rPlayerNum = game.countPlayers();
                if (rPlayerNum > MINPLAYERS && rPlayerNum <= MAXPLAYERS) {
                    game.delPlayer();
                    game.setInputs("start_or_continue");
                };
            });
            $("#btnAddPlayer").click(function(){
                let rPlayerNum = game.countPlayers();
                if (rPlayerNum < MAXPLAYERS) {
                    game.addPlayer(rPlayerNum + 1);
                    game.setInputs("start_or_continue");
                };
            });
            $(".btnRestart").click(function(){
                sessionStorage.clear();
            });
        },
        countPlayers: function() {
            return $(".card").length;
        },
        delPlayer: function() {
            let rPlayerNum = game.countPlayers(),
                rPlayerStr = dataType.player + rPlayerNum + "']",
                rPlayerCard = $(rPlayerStr + dataType.playerCard),
                tmpObj = JSON.parse(sessionStorage.storageGame);
            tmpObj.pop();
            sessionStorage.setItem("storageGame", JSON.stringify(tmpObj))
            rPlayerCard.remove();
        },
        init: function() {
            let renderStatus = "refresh";
            game.clickHandlers();
            if (sessionStorage.length > 1) {
                storageGame = sessionStorage.storageGame !="undefined" ? JSON.parse(sessionStorage.storageGame) : {};
                storageStat = sessionStorage.storageStat !="undefined" ? JSON.parse(sessionStorage.storageStat) : {};
                storageCorrectValues = sessionStorage.storageCorrectValues !="undefined" ? JSON.parse(sessionStorage.storageCorrectValues) : [];
            }
            if (sessionStorage.avatar !="undefined" && sessionStorage.avatar) {
                avatar = JSON.parse(sessionStorage.avatar);
            } else {
                shuffleArray(avatar);
                sessionStorage.setItem("avatar", JSON.stringify(avatar));
            }
            dataJson = {
                "gameJson" : storageGame,
                "statJson" : storageStat,
                "gameCorrectValues" : storageCorrectValues
            }
            game.render(dataJson, renderStatus)
            game.setInputs("start_or_continue");
        },
        render: function(dataJson, renderStatus) {
            if (!dataJson.error) {
                let gameJson = dataJson.gameJson,
                    statJson = dataJson.statJson,
                    gameCorrectValues = storageCorrectValues;
                if (!isEmpty(gameJson) && renderStatus !="refresh") {
                    let gameJsonPlayers = Object.keys(gameJson).length;
                    let tmpObj = sessionStorage.getItem("storageGame") ? JSON.parse(sessionStorage.getItem("storageGame")) : [];
                    let lastNumberOfAnswer = 0;
                    for (let player = 0; player < gameJsonPlayers; player++) {
                        if (!isEmpty(tmpObj[player])) {
                            lastNumberOfAnswer =  tmpObj[player]["answers"].length - 1
                            if (tmpObj[player]["answers"][lastNumberOfAnswer]["is_true"] == null) {
                                let is_true = gameJson[player]["answers"][lastNumberOfAnswer]["is_true"];
                                tmpObj[player]["answers"][lastNumberOfAnswer]["is_true"] = is_true;
                            } else {
                                lastNumberOfAnswer += 1;
                                let value = gameJson[player]["answers"][0]["value"],
                                    is_true = gameJson[player]["answers"][0]["is_true"],
                                    tmpObjAddData =  {"numberOfAnswer": lastNumberOfAnswer, "value": value, "is_true": is_true};
                                tmpObj[player]["answers"].push(tmpObjAddData)
                            }
                        } else {
                            let value = gameJson[player]["answers"][0]["value"],
                                is_true = gameJson[player]["answers"][0]["is_true"],
                                tmpObjAddData = {"id" : player, "answers" : [
                                    {"numberOfAnswer": lastNumberOfAnswer, "value": value, "is_true": is_true}
                                ]};
                            tmpObj.push(tmpObjAddData);
                        }
                    }
                    sessionStorage.setItem("storageGame", JSON.stringify(tmpObj));
                    storageGame = tmpObj;
                }
                if (!isEmpty(statJson) && renderStatus !="refresh") {
                    let tmpObj = {};
                    tmpObj = statJson;
                    sessionStorage.setItem("storageStat", JSON.stringify(tmpObj));
                    storageStat = tmpObj;
                }
                if (!isEmpty(gameCorrectValues) && renderStatus !="refresh") {
                    sessionStorage.setItem("storageCorrectValues", JSON.stringify(storageCorrectValues));
                }
                dataJson = {
                    gameJson : storageGame,
                    statJson : storageStat,
                    gameCorrectValues : storageCorrectValues
                }
                gameJson = isEmpty(dataJson["gameJson"]) ? {} : dataJson["gameJson"];
                statJson = isEmpty(dataJson["statJson"]) ? {} : dataJson["statJson"];
                correctAnswersList = isEmpty(dataJson["gameCorrectValues"]) ? {} : dataJson["gameCorrectValues"];
                switch(renderStatus) {
                    case "default":
                    case "refresh":
                        if (!isEmpty(gameJson)) {
                            let players = Object.keys(gameJson).length;
                            for (let player = 0; player < players; player++) {
                                let rPlayerNum = player + 1;
                                game.addPlayer(rPlayerNum);
                                let rPlayerStr = dataType.player + rPlayerNum + "']",
                                    gameNumLast = gameJson[player]["answers"].length - 1,
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard),
                                    rPlayerCardContent = $(rPlayerCard.find(dataType.content)),
                                    rPlayerCardContentValues = $(rPlayerCard.find(dataType.valuesList)),
                                    rPlayerCardContentCorrectValues = $(rPlayerCard.find(dataType.correctList)),
                                    rPlayerCardStatTotal = $(rPlayerCard.find(dataType.statTotal)),
                                    rPlayerCardFooter = $(rPlayerCard.find(".card-footer"));
                                rPlayerCardContent.show();
                                rPlayerCardContentValues.show();
                                rPlayerCardContentValues.prev("p").show();
                                rPlayerCardContentValues.empty(); //?
                                rPlayerCardContentCorrectValues.empty(); //?
                                for (let answer = 0; answer <= gameNumLast; answer++) {
                                    let gameValue = gameJson[player]["answers"][answer]["value"],
                                        gameIsTrue = gameJson[player]["answers"][answer]["is_true"];
                                    rPlayerCardContentValues.prepend("<li>" + gameValue + "</li>");
                                    rPlayerCardContentValues.find("li:first").data({
                                        "index" : answer,
                                        "value" : gameValue,
                                        "valueIsTrue" : gameIsTrue
                                    }).attr({
                                        "data-index" : answer,
                                        "data-value" : gameValue,
                                        "data-value-is-true" : gameIsTrue
                                    })
                                    if (gameIsTrue) {
                                        rPlayerCardContentValues.find("li:first").addClass("correctElement");
                                        rPlayerCardContentCorrectValues.show();
                                        rPlayerCardContentCorrectValues.prev("p").show();
                                        rPlayerCardContentCorrectValues.prepend("<li>" + gameValue + "</li>");
                                        rPlayerCardContentCorrectValues.find("li:first").addClass("correctElement");
                                    } else {
                                        rPlayerCardContentValues.find("li:first").addClass("wrongElement");
                                    }
                                }
                                rPlayerCardContentValues.find("li:first").addClass("lastElement");
                            }
                        } else {
                            $(".cards").empty()
                            for (let player = 0; player < MINPLAYERS; player++) {
                                rPlayerNum = player + 1;
                                rPlayerStr = dataType.player + rPlayerNum + "']";
                                game.addPlayer(rPlayerNum);
                            }
                        }
                        if (!isEmpty(statJson)) {
                            for (let player = 0; player < statJson.length; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']",
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard),
                                    rPlayerCardStatTotal = $(rPlayerCard.find(dataType.statTotal)),
                                    rPlayerCardStatTrue = $(rPlayerCard.find(dataType.statTrue)),
                                    rPlayerCardStatScore = $(rPlayerCard.find(dataType.statScore)),
                                    statJsonTotalVal = statJson[player]["total_answers"],
                                    statJsonTrueVal = statJson[player]["true_answers"],
                                    statJsonScoreVal = statJson[player]["score"] * 100;
                                $(rPlayerCardStatTotal).text(statJsonTotalVal);
                                $(rPlayerCardStatTrue).text(statJsonTrueVal);
                                $(rPlayerCardStatScore).text(statJsonScoreVal.toFixed()+"%");
                            }
                        }
                        if (!isEmpty(correctAnswersList)) {
                            let rCorrectAnswers = $(dataType.correctAnswers);
                                rCorrectAnswers.empty();
                                rCorrectAnswers.prev("p").show();
                                correctAnswersList.forEach(element => {
                                    $(rCorrectAnswers).prepend("<li>" + element + "</li>");
                                });
                        }
                        break;
                    case "start":
                        if (!isEmpty(gameJson)) {
                            let players = Object.keys(gameJson).length;
                            for (let player = 0; player < players; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']";
                                let gameNumLast = gameJson[player]["answers"].length - 1,
                                    gameIsTrue = gameJson[player]["answers"][gameNumLast]["is_true"],
                                    gameLastValue = gameJson[player]["answers"][gameNumLast]["value"],
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard),
                                    rPlayerCardContent = $(rPlayerCard.find(dataType.content)),
                                    rPlayerCardContentValues = $(rPlayerCard.find(dataType.valuesList)),
                                    rPlayerCardFooter = $(rPlayerCard.find(".card-footer"));
                                    rPlayerCardContent.show();
                                    rPlayerCardContentValues.prev("p").show();
                                rPlayerCardContentValues.find("li:first").removeClass("lastElement");
                                rPlayerCardContentValues.prepend("<li>" + gameLastValue + "</li>").hide().fadeIn(DELAY);
                                rPlayerCardContentValues.find("li:first").data({
                                    "index" : gameNumLast,
                                    "value" : gameLastValue,
                                    "valueIsTrue" : gameIsTrue
                                }).attr({
                                    "data-index" : gameNumLast,
                                    "data-value" : gameLastValue,
                                    "data-value-is-true" : gameIsTrue
                                }).addClass("lastElement");
                            }
                        }
                        if (!isEmpty(statJson)) {
                            for (let player = 0; player < statJson.length; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']";
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard);
                                    rAreaStatTotal = $(rPlayerCard.find(dataType.statTotal)),
                                    rAreaStatTrue = $(rPlayerCard.find(dataType.statTrue)),
                                    rAreaStatScore = $(rPlayerCard.find(dataType.statScore)),
                                    statTotalVal = statJson[player]["total_answers"],
                                    statTrueVal = statJson[player]["true_answers"],
                                    statScoreVal = statJson[player]["score"] * 100;
                                $(rAreaStatTotal).text(statTotalVal + 1);
                                $(rAreaStatTrue).text(statTrueVal);
                                $(rAreaStatScore).text(statScoreVal.toFixed()+"%");
                            }
                        }
                        break;
                    case "validate":
                        if (!isEmpty(gameJson)) {
                            for (let player = 0; player < gameJson.length; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']",
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard),
                                    rPlayerCardContent = $(rPlayerCard.find(dataType.content)),
                                    rPlayerCardContentValues = $(rPlayerCard.find(dataType.valuesList)),
                                    rPlayerCardContentCorrectValues = $(rPlayerCard.find(dataType.correctList)),
                                    gameNumLast = gameJson[player]["answers"].length - 1,
                                    gameIsTrue = gameJson[player]["answers"][gameNumLast]["is_true"],
                                    gameLastValue = gameJson[player]["answers"][gameNumLast]["value"];
                                    rPlayerCardContentValues.find("li:first").
                                                                data("valueIsTrue", gameIsTrue).
                                                                attr("data-value-is-true", gameIsTrue);
                                if (gameIsTrue) {
                                    rPlayerCardContentCorrectValues.show();
                                    rPlayerCardContentCorrectValues.prev("p").show();
                                    rPlayerCardContentCorrectValues.prepend("<li>" + gameLastValue + "</li>");
                                    rPlayerCardContentCorrectValues.find("li:first").addClass("correctElement");
                                    rPlayerCardContentValues.find("li:first").addClass("correctElement");
                                } else {
                                    rPlayerCardContentValues.find("li:first").addClass("wrongElement");
                                }
                            }
                        }
                        if (!isEmpty(statJson)) {
                            tmpValue = 0;
                            tmpPlayer = "";
                            for (let player = 0; player < statJson.length; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']";
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard);
                                    rAreaStatTotal = $(rPlayerCard.find(dataType.statTotal)),
                                    rAreaStatTrue = $(rPlayerCard.find(dataType.statTrue)),
                                    rAreaStatScore = $(rPlayerCard.find(dataType.statScore)),
                                    statTotalVal = statJson[player]["total_answers"],
                                    statTrueVal = statJson[player]["true_answers"],
                                    statScoreVal = statJson[player]["score"] * 100;
                                $(rAreaStatTotal).text(statTotalVal);
                                $(rAreaStatTrue).text(statTrueVal);
                                $(rAreaStatScore).text(statScoreVal.toFixed()+"%");
                                $(rPlayerCard).find(".avatar").removeClass("wobble-hor-bottom");
                                if (tmpValue <= statScoreVal) {
                                    tmpValue = statScoreVal;
                                    tmpPlayer = rPlayerCard;
                                }
                            }
                            $(tmpPlayer).find(".avatar").addClass("wobble-hor-bottom");
                        }
                        if (correctAnswersList) {
                            let rCorrectAnswers = $(dataType.correctAnswers);
                                rCorrectAnswers.empty();
                                rCorrectAnswers.prev("p").show();
                                correctAnswersList.forEach(element => {
                                    $(rCorrectAnswers).prepend("<li>" + element + "</li>");
                                });
                        }
                        break;
                };
            } else {
                $("#errors").text(dataJson.error);
            };
        },
        setInputs: function(gameStatus) {
            let btnStart = $("#btnStartGame"),
                inputCorrectAnswer = $("#inputCorrectAnswer"),
                btnCorrectAnswer = $("#btnCorrectAnswer"),
                btnAddPlayer = $("#btnAddPlayer"),
                btnDelPlayer = $("#btnDelPlayer");
            switch(gameStatus) {
                case "start_or_continue":
                    let countPlayersVal = game.countPlayers();
                    btnStart.prop("disabled", false);
                    btnStart.focus();
                    inputCorrectAnswer.prop("disabled", true);
                    btnCorrectAnswer.prop("disabled", true);
                    if (countPlayersVal < MAXPLAYERS && countPlayersVal > MINPLAYERS) {
                        btnAddPlayer.prop("disabled", false);
                        btnDelPlayer.prop("disabled", false);
                    } else if (countPlayersVal == MINPLAYERS || countPlayersVal == 0) {
                        btnAddPlayer.prop("disabled", false);
                        btnDelPlayer.prop("disabled", true);
                    } else if (countPlayersVal == MAXPLAYERS) {
                        btnAddPlayer.prop("disabled", true);
                        btnDelPlayer.prop("disabled", false);
                    };
                    break;
                case "data_received":
                    btnStart.prop("disabled", true);
                    inputCorrectAnswer.prop("disabled", false);
                    inputCorrectAnswer.focus();
                    btnCorrectAnswer.prop("disabled", true);
                    btnAddPlayer.prop("disabled", true);
                    btnDelPlayer.prop("disabled", true);
                    break;
                case "input":
                    btnStart.prop("disabled", true);
                    inputCorrectAnswer.prop("disabled", true);
                    btnCorrectAnswer.prop("disabled", false);
                    btnCorrectAnswer.focus();
                    btnAddPlayer.prop("disabled", true);
                    btnDelPlayer.prop("disabled", true);
                    break;
                default:
                    $("#errors").text("set inputs error");
                    break;
            }
        },
        startGame: function() {
            let renderStatus = "start";
            dataToServer.gameStart = 1;
            dataToServer.countPlayers = game.countPlayers();
            dataToServer.inputCorrectAnswer = null;
            game.ajaxCall(urlParamStart, dataToServer).done(function(data) {
                game.render(data, renderStatus);
            }).fail(function() {
                $("#errors").text("start game error: please reload");
            });

        },
        validateForm: function() {
            let isFormValid = false,
            correctAnswerVal = parseInt($("#inputCorrectAnswer").val());
            if (correctAnswerVal >= 10 && correctAnswerVal < 100 ) {
                isFormValid = true;
            }
            return isFormValid;
        },
        validateGame: function() {
            let correctAnswerVal = $("#inputCorrectAnswer").val();
            let renderStatus = "validate";
            storageCorrectValues.push(parseInt(correctAnswerVal));
            dataToServer.gameStart = 0;
            dataToServer.countPlayers = 0;
            dataToServer.inputCorrectAnswer = correctAnswerVal;
            dataToServer.gameJson = sessionStorage.getItem("storageGame");
            game.ajaxCall(urlParamGameValidate, dataToServer).done(function(data) {
                game.render(data, renderStatus);
            }).fail(function() {
                $("#errors").text("validate  game error: please reload");
            });
        }
    };
    game.init();
});

function isEmpty(obj) {
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
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