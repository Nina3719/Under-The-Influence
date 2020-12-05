let current_index = 0;
let selected_value = false;
let question_number = 6;

let questions = [
    {
        id: 0,
        question: "Do you need to drink more in order to feel the effects of alcohol?",
        answer: false,
    },
    {
        id: 1,
        question: "Do you feel guilty about drinking?",
        answer: false,
    },
    {
        id: 2,
        question: "Do you become irritable or violent when you’re drinking?",
        answer: false,
    },
    {
        id: 3,
        question: "Do you have problems at school or work because of drinking?",
        answer: false,
    },
    {
        id: 4,
        question: "Do you feel interference from alcohol with your relationships?",
        answer: false,
    },
    {
        id: 5,
        question: "Do you think it might be better if you cut back on your drinking?",
        answer: false,
    },
];

function startDiagnoseQuiz() {

    $( "#diagnose-button" ).hide( "slow");

    $( "#diagnose-quiz-container" ).show( "slow");
    $( "#diagnose-quiz-content" ).show( "slow");

    $( "#diagnose-quiz-question" ).text(questions[current_index].question);
}

function populateDiagnoseResult() {
    let count = 0;

    for(let i = 0; i < question_number; i++) {
        if(questions[i].answer) {
            count += 1;
            document.getElementById("diagnose-result-questions").innerHTML +=
                `
                    <div style="color: #DE4C44;">
                        <i class="far fa-frown"></i> ${questions[i].question}
                    </div>
                `
        } else {
            document.getElementById("diagnose-result-questions").innerHTML +=
                `
                    <div style="color: #4d8d6a;">
                        <i class="far fa-smile"></i> ${questions[i].question}
                    </div>
                `
        }
    }

    document.getElementById("diagnose-result").innerHTML =
        `You answered yes to ${count}/${question_number} of the questions highlighted in red below:`

    if (count <= 1) {
        document.getElementById("diagnose-result-recommendation").innerHTML =
            "There is a low likelihood that you misuse alcohol!"
    } else {
        document.getElementById("diagnose-result-recommendation").innerHTML =
            "There is a high likelihood that you likely misuse alcohol! "
    }

    document.getElementById("diagnose-result-recommendation").innerHTML +=
        "<br> Check the resources below for more comprehensive self-tests to assess whether you misuse alcohol: "
}

function diagnoseQuizNext() {
    $("#diagnose-button-next").prop("disabled",true);
    $("#radioNo").prop('checked', false);
    $("#radioYes").prop('checked', false);

    let allProgressBarItem = document.getElementsByClassName('progtrckr-todo');
    allProgressBarItem[0].className = 'progtrckr-done';

    questions[current_index].answer = selected_value;
    current_index += 1;

    if (current_index === question_number - 1) {
        $( "#diagnose-button" ).text("Submit");
    }

    if (current_index === question_number) {
        $( "#diagnose-quiz-content" ).hide( "slow");

        $( "#diagnose-quiz-result" ).show( "slow");

        populateDiagnoseResult();
    }

    $( "#diagnose-quiz-question" ).text(questions[current_index].question);
}


function handleDiagnoseClick(event) {
    selected_value = event.value === "true" ? true: false;
    $("#diagnose-button-next").prop("disabled",false);
}