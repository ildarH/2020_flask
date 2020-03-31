function refresh_page (data, extrasense_number, last_answer, true_answers, total_answers, score){

    $("#extrasense_"+[extrasense_number+1]+"_stat").attr("max", total_answers).val(true_answers);
                    
    for (let extrasense_answer = 0; extrasense_answer <= last_answer; extrasense_answer++) {

        let wrap_tag_L = '<li id="extrasense_'+[extrasense_number+1]+'_answer_'+extrasense_answer+'">',
            wrap_tag_R = '</li>',
            answer_value = data[0][extrasense_number]['answers'][extrasense_answer]['value'],
            validate = data[0][extrasense_number]['answers'][extrasense_answer]['is_true'];

        // $("#extrasense_"+[extrasense_number+1]).find(":hidden").show(50);

        $("#extrasense_"+[extrasense_number+1]+"_answersList").prepend(wrap_tag_L+answer_value+wrap_tag_R);

        $("#extrasense_"+[extrasense_number+1]+"_stat_total").text(total_answers);
        $("#extrasense_"+[extrasense_number+1]+"_stat_true").text(true_answers);
        $("#extrasense_"+[extrasense_number+1]+"_stat_score").text(score.toFixed()+"%");

        if (validate) {
            $("#extrasense_"+[extrasense_number+1]).find(".card-content").show(100);
            $("#extrasense_"+[extrasense_number+1]+"_assumption_header").show(100);
            $("#extrasense_"+[extrasense_number+1]+"_correct_header").show(100);
            $("#extrasense_"+[extrasense_number+1]+"_correctList").show(100);
            $("#extrasense_"+[extrasense_number+1]+"_answer_"+extrasense_answer).addClass("correctElement");
            $("#extrasense_"+[extrasense_number+1]+"_correctList").prepend(wrap_tag_L+answer_value+wrap_tag_R);
        } else {
            $("#extrasense_"+[extrasense_number+1]+"_answer_"+extrasense_answer).addClass("wrongElement");
        };

    }

}

function validate_form () {

    let is_form_valid = false,
        correct_answer = parseInt($("#correct_answer").val());

    if (correct_answer >= 10 && correct_answer < 100 ) {
        is_form_valid = true;
    }

    return is_form_valid;
}

function set_inputs (game_status) {

    let correct_answer = $("#correct_answer"),
        btn_start = $("#btn_start"),
        btn_correct_answer = $("#btn_correct_answer");

    if (game_status === "start_or_continue") {
        btn_start.prop("disabled", false);
        correct_answer.prop("disabled", true);
        btn_correct_answer.prop("disabled", true);
    } else if (game_status === "data_received") {
        btn_start.prop("disabled", true);
        correct_answer.prop("disabled", false);
        btn_correct_answer.prop("disabled", true);
    } else if (game_status === "input") {
        btn_start.prop("disabled", true);
        correct_answer.prop("disabled", true);
        btn_correct_answer.prop("disabled", false);
    };

}



$(document).ready(function() {

    set_inputs ("start_or_continue");
        
    // load data from server

    $.ajax({
        url : "/",
        type : "POST",
        
        dataType : "json",
        success:function(data){
            console.log("data: "+data)
        },
        error: function(Data){
            console.log("data don't received")
        }
        
    }).done(function(data){

        let refresh = $(".answersList").find('*').length;

        if (data[0].length > 0 && refresh == 0) {
            
            for (let extrasense_number = 0; extrasense_number < data[0].length; extrasense_number++) {
                if (extrasense_number > 1){
                    add_player();
                    $("#extrasense_"+[extrasense_number+1]).children(".card-front").hide()
                    $("#extrasense_"+[extrasense_number+1]).children(".card-back").show()
                }
                let last_answer = data[0][extrasense_number]['answers'].length-1;

                try {
                    let true_answers = data[1]["statistics_list"][extrasense_number]["true_answers"],
                        total_answers = data[1]["statistics_list"][extrasense_number]["total_answers"],
                        score = data[1]["statistics_list"][extrasense_number]["score"]*100;
                        refresh_page (data, extrasense_number, last_answer, true_answers, total_answers, score);
                } catch {
                    let true_answers = 0,
                        total_answers = 0,
                        score = 0;
                        refresh_page (data, extrasense_number, last_answer, true_answers, total_answers, score);
                };

            };

        };

        if (data[2].length > 0) {
            $("#correct_answers").html(JSON.stringify(data[2], null, 2));
        };
    });

    // game start

    $("#btn_start").click(function(event) {

        let game_start = $("#start").val(),
            count_players = $(".card-back:visible").length;

        console.log("count_players: " + count_players)

        $.ajax ({

            data : {
                "game_start" : game_start,
                "count_players" : count_players
            },
            type : "POST",
            url : "/gamestart",
            dataType: "json"

        }).done(function(data){

            if (data.error) {

                $("#errors").text(data.error);

            }
            else {

                for (let extrasense_number = 0; extrasense_number < data[0].length; extrasense_number++) {
                    let last_answer = data[0][extrasense_number]['answers'].length-1,
                        wrap_tag_L = '<li id="extrasense_'+[extrasense_number+1]+'_answer_'+last_answer+'">',
                        wrap_tag_R = '</li>',
                        answer_value = data[0][extrasense_number]['answers'][last_answer]['value'],
                        self = $("#extrasense_"+[extrasense_number+1]),
                        self_remove_css_property = $("#extrasense_"+[extrasense_number+1]+"_answer_"+[last_answer-1]),
                        self_add_css_property = $("#extrasense_"+[extrasense_number+1]+"_answer_"+last_answer),
                        self_prepend_value = $("#extrasense_"+[extrasense_number+1]+"_answersList"),
                        self_update_stat = $("#extrasense_"+[extrasense_number+1]+"_stat_total");

                    self.find(".card-content").show(100);
                    self.find(".card-content").children("#extrasense_"+[extrasense_number+1]+"_assumption_header").show(100);
                    self_remove_css_property.removeClass("lastElement");
                    self_prepend_value.prepend(wrap_tag_L+answer_value+wrap_tag_R);
                    self_add_css_property.addClass("lastElement");
                    self_update_stat.text(last_answer+1);

                    // $("#extrasense_"+[extrasense_number+1]).children(".card-content").show(100);
                    // $("#extrasense_"+[extrasense_number+1]).children("p#assumption_header").show(100);
                    // $("#extrasense_"+[extrasense_number+1]+"_answer_"+[last_answer-1]).removeClass("lastElement");
                    // $("#extrasense_"+[extrasense_number+1]+"_answersList").prepend(wrap_tag_L+answer_value+wrap_tag_R);
                    // $("#extrasense_"+[extrasense_number+1]+"_answer_"+last_answer).addClass("lastElement");
                    // $("#extrasense_"+[extrasense_number+1]+"_stat_total").text(last_answer+1);
                    
                };

                set_inputs ("data_received");

            };

        });

    });

    // input

    $("#correct_answer").keyup(function(){

        is_form_valid = validate_form ();

        $("#btn_correct_answer").toggleClass("disabled", is_form_valid);

        if (is_form_valid) {

            set_inputs ("input");

        };
    });

    // validate

    $("#btn_correct_answer").click(function(event){

        let correct_answer = $("#correct_answer").val();

        $.ajax ({

            data: {
                "correct_answer" : correct_answer
            },
            type : "POST",
            url : "/gamevalidate",
            dataType : "json"

        }).done(function(data){

            if (data.error) {

                $("errors").text(data.error);

            }
            else {

                $("#correct_answer").val("");

                for (let extrasense_number = 0; extrasense_number < data[0].length; extrasense_number++) {

                    let last_answer = data[0][extrasense_number]['answers'].length-1,
                        validate = data[0][extrasense_number]['answers'][last_answer]['is_true'],
                        answer_value = data[0][extrasense_number]['answers'][last_answer]['value'],
                        true_answers = data[1]["statistics_list"][extrasense_number]["true_answers"],
                        total_answers = data[1]["statistics_list"][extrasense_number]["total_answers"],
                        score = data[1]["statistics_list"][extrasense_number]["score"]*100,
                        wrap_tag_L = '<li id="extrasense_'+[extrasense_number+1]+'_answer_'+last_answer+'">',
                        wrap_tag_R = '</li>';
                    
                    $("#extrasense_"+[extrasense_number+1]+"_stat").attr("max", total_answers).val(true_answers);
                    $("#extrasense_"+[extrasense_number+1]+"_stat_total").text(total_answers);
                    $("#extrasense_"+[extrasense_number+1]+"_stat_true").text(true_answers);
                    $("#extrasense_"+[extrasense_number+1]+"_stat_score").text(score.toFixed()+"%");

                    if (validate) {
                        $("#extrasense_"+[extrasense_number+1]).children(".card-content").show(100);
                        $("#extrasense_"+[extrasense_number+1]+"_correct_header").show(100);
                        $("#extrasense_"+[extrasense_number+1]+"_correctList").show(100);
                        $("#extrasense_"+[extrasense_number+1]+"_answer_"+last_answer).addClass("correctElement");
                        $("#extrasense_"+[extrasense_number+1]+"_correctList").prepend(wrap_tag_L+answer_value+wrap_tag_R);
                    } else {
                        $("#extrasense_"+[extrasense_number+1]+"_answer_"+last_answer).addClass("wrongElement");
                    };
                
                };

                set_inputs ("start_or_continue");

            };
        });

    });

    // add player

    $(".card-front").click(add_player)

        // add_player (object);

        // $(this).hide();
        // $(this).next().show(200);
        // $(".card:hidden").eq(0).show(1000);
        // $(this).parent("div.card").prev().find(".card-btn_close").hide();

    // });

    // delete player

    $(".card-btn_close").click(del_player)

        // del_player (object);

        // $(this).closest(".card-back").hide();
        // $(this).closest(".card-back").prev("div.card-front").show(50);
        // $(this).closest(".card").next().hide();
        // $(this).closest(".card").prev().find(".card-btn_close").show();

    // });


    // event.preventDefault();

});

function add_player () {

    $(this).hide();
    $(this).next().show(200);
    $(".card:hidden").eq(0).show(1000);
    $(this).parent("div.card").prev().find(".card-btn_close").hide();

}

function del_player () {

    $(this).closest(".card-back").hide();
    $(this).closest(".card-back").prev("div.card-front").show(50);
    $(this).closest(".card").next().hide();
    $(this).closest(".card").prev().find(".card-btn_close").show();
    parent = $(this).closest(".card");
    stats_field = parent.find(".value");
    stats_field.empty();
    parent.find(".card-content").children("ul.answersList").empty();
    parent.find(".card-content").children("ul.answersList").hide();
    parent.find(".card-content").hide();
    parent.find(".card-footer").hide();
    // $(this).closest(".card-content").children("ul.answersList").empty();
    // $(this).closest(".card-footer").()

}