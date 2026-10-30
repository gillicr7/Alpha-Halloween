
const answerButton = document.getElementById("answerButton");
const message = document.getElementById("message");
const phone = document.querySelector(".phone");

answerButton.addEventListener("click", AnswerCall);

function AnswerCall() {
    message.textContent =
        "GHOSTFACE: Hello. Do you like scary code?";

    phone.textContent = "💀";
    answerButton.textContent = "START GAME";

    answerButton.removeEventListener("click", AnswerCall);
    answerButton.addEventListener("click", StartGame);
}

function StartGame() {
    message.textContent = "Your nightmare begins...";
    answerButton.style.display = "none";
}
