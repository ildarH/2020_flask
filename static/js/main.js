$(document).ready(function() {

    let urlParamRefresh             = "/",
        urlParamStart               = "/gamestart",
        urlParamGameValidate        = "/gamevalidate";
    let gameStartVal                = 0,
        countPlayersVal             = 0,
        correctAnswerVal            = 0;
    let dataToServer                = {
            "game_start"            : gameStartVal,
            "count_players"         : countPlayersVal,
            "input_correct_answer"  : correctAnswerVal
        };

    let players_                    = ['🐴', '🐵', '🐸', '🐹', '🦁'];
    // let players_                    = {0: "&#128052;",1:"&#128053;"};

    let dataType                    = {
                content             : "[data-type='content']",
                correctAnswers      : "[data-type='correct-answers']",
                correctList         : "[data-type='correctList']",
                close               : "[data-type='btn_close']",
                playerCard          : "[data-type='player-card']",
                statistic           : "[data-type='statistic']",
                statTotal           : "[data-stat-total]",
                statTrue            : "[data-stat-true]",
                statScore           : "[data-stat-score]",
                valuesList          : "[data-type='valuesList']",
                player              : "[data-player='"
    }

    let game = {
        init: function() {
            let renderStatus = "refresh"
            game.clickHandlers();
            gameStartVal = 0;
            dataToServer.game_start = 1;
            dataToServer.count_players = this.countPlayers;
            dataToServer.input_correct_answer = null;
            this.ajaxCall(urlParamRefresh, dataToServer).done(function(data) {
                game.render(data, renderStatus);
            });
            game.setInputs("start_or_continue");

            console.log(players_)
            for(var i = 0; i < players_.length; i++){
                $("#correct_answers").append(" ", players_[i] , " ");
              }
            

        },
        clickHandlers: function() {
            $("#btn_start").click(function() {
                game.gameStart();
                game.setInputs("data_received");
                $("#input_correct_answer").val("");
            });
            $("#input_correct_answer").keyup(function() {
                let isFormValid = false;
                isFormValid = game.validateForm();
                $("btn_correct_answer").toggleClass("disabled", isFormValid);
                if (isFormValid) {
                    game.setInputs("input");
                }
            });
            $("#btn_correct_answer").click(function() {
                game.validateGame();
                game.setInputs("start_or_continue");
                $("#input_correct_answer").val("");
            });
            $(".card-front").click(function() {
                game.addPlayer();
            });
            $(".card-btn_close").click(function() {
                game.delPlayer();
            });
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
        gameStart: function() {
            let renderStatus = "start";
            dataToServer.game_start = 1;
            dataToServer.count_players = game.countPlayers;
            dataToServer.input_correct_answer = null;
            game.ajaxCall(urlParamStart, dataToServer).done(function(data) {
                game.render(data, renderStatus);
            });
        },
        validateGame: function() {
            let correctAnswerVal = $("#input_correct_answer").val();
            let renderStatus = "validate";
            dataToServer.game_start = 0;
            dataToServer.count_players = 0;
            dataToServer.input_correct_answer = correctAnswerVal;
            game.ajaxCall(urlParamGameValidate, dataToServer).done(function(data) {
                game.render(data, renderStatus);
            });
        },
        render: function(dataJson, renderStatus) {
            if (!dataJson.error) {

                let gameJson = dataJson[0],
                statJson = dataJson[1]["statistics_list"],
                correctAnswersList = dataJson[2];



                switch(renderStatus){

                    case "start":
                    case "refresh":
                    case "default":

                        if (gameJson.length > 0) {

                            for (let player = 0; player < gameJson.length; player++) {

                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']";

                                let gameNumLast = gameJson[player]["answers"].length - 1,
                                    gameIsTrue = gameJson[player]["answers"][gameNumLast]["is_true"],
                                    gameLastValue = gameJson[player]["answers"][gameNumLast]["value"],
                                    rPlayerCard = $(rPlayerStr + dataType.playerCard),
                                    rPlayerCardContent = $(rPlayerStr + dataType.content),
                                    rPlayerCardContentValues = $(rPlayerStr + dataType.valuesList),
                                    rPlayerCardContentCorrectValues = $(rPlayerStr + dataType.correctList),
                                    rPlayerCardStatTotal = $(rPlayerStr+dataType.statTotal),
                                    rPlayerCardFooter = rPlayerCard.children(".card-footer");
                                    game.addPlayer(rPlayerNum);
                                    if (rPlayerCardContent.is(":hidden")) {
                                        rPlayerCardContent.show();
                                        rPlayerCardContentValues.show();
                                        rPlayerCardContentValues.prev("p").show();
                                    }
                                    rPlayerCardStatTotal.text(gameNumLast + 1);
                                    rPlayerCardContentValues.empty();
                                    rPlayerCardContentCorrectValues.empty();
                                    for (let answer = 0; answer <= gameNumLast; answer++) {
                                        let gameValue = gameJson[player]["answers"][answer]["value"],
                                            gameIsTrue = gameJson[player]["answers"][answer]["is_true"];
                                        rPlayerCardContentValues.prepend("<li>" + gameValue + "</li>");
                                        rPlayerCardContentValues.find("li:first").data("index", answer);
                                        rPlayerCardContentValues.find("li:first").attr("[data-index='" + answer + "']");
                                        if (gameIsTrue) {
                                            rPlayerCardContentValues.find("li:first").addClass("correctElement");
                                            rPlayerCardContentCorrectValues.show();
                                            rPlayerCardContentCorrectValues.prev("p").show();
                                            rPlayerCardContentCorrectValues.prepend("<li>" + gameValue + "</li>");
                                        } else {
                                            rPlayerCardContentValues.find("li:first").addClass("wrongElement");
                                        }
                                    }
                            }
                        }
                        if (statJson.length > 0) {
                            let playersCount = statJson.length;
                            for (let player = 0; player < playersCount; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']";
                                let statTotalVal = statJson[player]["total_answers"],
                                    statTrueVal = statJson[player]["true_answers"],
                                    statScoreVal = statJson[player]["score"] * 100,
                                    rAreaStatTotal = $(rPlayerStr+dataType.statTotal),
                                    rAreaStatTrue = $(rPlayerStr+dataType.statTrue),
                                    rAreaStatScore = $(rPlayerStr+dataType.statScore);
                                $(rAreaStatTotal).text(statTotalVal);
                                $(rAreaStatTrue).text(statTrueVal);
                                $(rAreaStatScore).text(statScoreVal.toFixed()+"%");
                            }
                        }
                        if (correctAnswersList.length > 0) {
                            let rCorrectAnswers = $(dataType.correctAnswers);
                                rCorrectAnswers.empty();
                                correctAnswersList.forEach(element => {
                                    $(rCorrectAnswers).prepend("<li>" + element + "</li>");
                                });
                        }
                        break;

                    case "validate":
                        if (gameJson.length > 0) {
                            for (let player = 0; player < gameJson.length; player++) {
                                let rPlayerNum = player + 1,
                                    rPlayerStr = dataType.player + rPlayerNum + "']",
                                    rPlayerCard = $(rPlayerStr+dataType.playerCard),
                                    rPlayerCardContentCorrectValues = $(rPlayerStr + dataType.correctList),
                                    gameNumLast = gameJson[player]["answers"].length - 1
                                    rPlayerCardContentCorrectValues.empty();
                                for (let answer = 0; answer <= gameNumLast; answer++) {
                                    let gameIsTrue = gameJson[player]["answers"][answer]["is_true"],
                                        gameValue = gameJson[player]["answers"][answer]["value"];
                                        if (gameIsTrue) {
                                            rPlayerCardContentCorrectValues.show();
                                            rPlayerCardContentCorrectValues.prev("p").show();
                                            rPlayerCardContentCorrectValues.prepend("<li>" + gameValue + "</li>");
                                            rPlayerCardContentCorrectValues.find("li:first").addClass("correctElement");
                                        }
                                }
                            }
                        }
                        break;
                    
                    case "btns":

                }

            } else {
                $("#errors").text(dataJson.error);
            }

        },
        addPlayer: function(rPlayerNum = game.countPlayers() + 1) {
            let playerCurNum = game.countPlayers(),
                playerNextNum = rPlayerNum + 1,
                rPlayerCurStr = dataType.player + playerCurNum + "']",
                rPlayerStr = dataType.player + rPlayerNum + "']",
                rPlayerNextStr = dataType.player + playerNextNum + "']",
                rPlayerCardCur = $(rPlayerCurStr + dataType.playerCard),
                rPlayerCardCurBtn = rPlayerCardCur.find(".card-btn_close"),
                rPlayerCard = $(rPlayerStr + dataType.playerCard),
                rPlayerCardBack = rPlayerCard.children(".card-back"),
                rPlayerCardFront = rPlayerCard.children(".card-front"),
                rPlayerCardBtn = rPlayerCard.find(".card-btn_close"),
                rPlayerCardNext = $(rPlayerNextStr + dataType.playerCard),
                rPlayerCardNextFront = rPlayerCardNext.children(".card-front");
            rPlayerCardCurBtn.hide();
            rPlayerCard.show();
            rPlayerCardBack.show();
            rPlayerCardFront.hide();
            rPlayerCardBtn.show();
            rPlayerCardNext.show();
            rPlayerCardNextFront.show();
        },
        delPlayer: function() {
            console.log("delPlayer");
            let playerCurNum = game.countPlayers(),
                rPlayerCurStr = dataType.player + playerCurNum + "']",
                playerPrevNum = rPlayerNum - 1,
                rPlayerPrevStr = dataType.player + playerPrevNum + "']",
                rPlayerCardCur = $(rPlayerCurStr + dataType.playerCard),
                rPlayerCardCurBtn = rPlayerCardCur.find(".card-btn_close"),
                rPlayerCard = $(rPlayerStr + dataType.playerCard),
                rPlayerCardBack = rPlayerCard.children(".card-back"),
                rPlayerCardFront = rPlayerCard.children(".card-front"),
                rPlayerCardBtn = rPlayerCard.find(".card-btn_close"),
                rPlayerCardNext = $(rPlayerNextStr + dataType.playerCard),
                rPlayerCardNextFront = rPlayerCardNext.children(".card-front");




            // let posToClear = $(".card-back:visible").parent().last(),
            //     player = $(posToClear).attr("data-player");
            //     statDataToClear = $(".value[data-player="+player+"][data-type='statistic']"),
            //     posToShow = $(".card[data-player="+[player]+"][data-type='player-card']").find(".card-front"),
            //     valueDataToClear = $("[data-player="+player+"][data-type='content'] > ul");
            //     $(statDataToClear).empty();
            //     $(valueDataToClear).empty();
            //     $(valueDataToClear).hide();
            //     $(valueDataToClear).parent().hide();
            //     $(posToClear).hide();
            //     if (player != 3) {
            //         $(posToShow).next().show();
            //     }
            //     $(posToClear).prev().find(".card-btn_close").show();
        },
        countPlayers: function() {
            console.log("countPlayers: " + $(".card-back:visible").length);
            return $(".card-back:visible").length;
        },
        setInputs: function(gameStatus) {
            let btnStart = $("#btn_start"),
                inputCorrectAnswer = $("#input_correct_answer"),
                btnCorrectAnswer = $("#btn_correct_answer");
            switch(gameStatus) {
                case "start_or_continue":
                    btnStart.prop("disabled", false);
                    inputCorrectAnswer.prop("disabled", true);
                    btnCorrectAnswer.prop("disabled", true);
                    break;
                case "data_received":
                    btnStart.prop("disabled", true);
                    inputCorrectAnswer.prop("disabled", false);
                    btnCorrectAnswer.prop("disabled", true);
                    break;
                case "input":
                    btnStart.prop("disabled", true);
                    inputCorrectAnswer.prop("disabled", true);
                    btnCorrectAnswer.prop("disabled", false);
                    break;
                default:
                    $("#errors").text("set inputs error");
                    break;
            }
        },
        validateForm: function() {
            let isFormValid = false,
            correctAnswerVal = parseInt($("#input_correct_answer").val());
            if (correctAnswerVal >= 10 && correctAnswerVal < 100 ) {
                isFormValid = true;
            }
            return isFormValid;
        }
    };
    game.init();
});