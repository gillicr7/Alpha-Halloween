
const answerButton = document.getElementById("answerButton");
const message = document.getElementById("message");
const phone = document.querySelector(".phone");
const enableRingingButton = document.getElementById("enableRingingButton");
let callAnswered = false;

async function StartRinging() {
    if (callAnswered) return;
    try {
        await sounds.ringing.play();
        if (callAnswered) {
            stopSound("ringing");
            return;
        }
        enableRingingButton.hidden = true;
        soundStatus.textContent = "";
    } catch (error) {
        if (callAnswered || error.name === "AbortError") return;
        if (error.name === "NotAllowedError") {
            enableRingingButton.hidden = false;
            soundStatus.textContent = "Enable ringing to hear the incoming call.";
        } else {
            soundStatus.textContent = `Could not play ringing: ${error.message}`;
        }
    }
}

enableRingingButton.addEventListener("click", StartRinging);
StartRinging();

answerButton.addEventListener("click", AnswerCall);

function AnswerCall() {
    callAnswered = true;
    stopSound("ringing");
    enableRingingButton.hidden = true;
    soundStatus.textContent = "";
    message.textContent =
        "GHOSTFACE: Hello. Do you like scary code?";

    phone.textContent = "💀";
    answerButton.textContent = "START SHOOTING";

    answerButton.removeEventListener("click", AnswerCall);
    answerButton.addEventListener("click", StartGame);
}

function StartGame() {
    soundStatus.textContent = "";
    message.textContent = "Your nightmare begins...";
    answerButton.style.display = "none";
    StartShootingGame();
}

document.addEventListener("shootingGameEnded", event => {
    playRoundEnding(event.detail.won);
    message.textContent = event.detail.won
        ? "You survived! Ready for another round?"
        : "Try again. Shoot 10 monsters to survive!";
    answerButton.textContent = "START SHOOTING";
    answerButton.style.display = "";
});
