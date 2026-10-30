const answerButton = document.getElementById("answerButton");
const message = document.getElementById("message");
const phone = document.querySelector(".phone");
let callAnswered = false;

answerButton.addEventListener("click", () => {
    if (callAnswered) StartGame();
    else AnswerCall();
});

function AnswerCall() {
    callAnswered = true;
    message.textContent = "GHOSTFACE: Hello. Do you like scary code?";
    phone.textContent = "💀";
    answerButton.textContent = "START GAME";
    initializeAudio();
}

function StartGame() {
    initializeAudio();
    startHorrorCraft();
}

function resetStartMenu() {
    callAnswered = false;
    message.textContent = "INCOMING CALL...";
    phone.textContent = "☎";
    answerButton.textContent = "ANSWER CALL";
    document.getElementById("soundStatus").textContent = "";
    answerButton.focus();
}
