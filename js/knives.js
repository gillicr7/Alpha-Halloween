// One shared template; CSS places each knife at a fixed position on the character.
const knifePositions = ["left-foot", "right-hand", "left-hand", "chest", "right-leg", "left-shoulder"];

function createKnives() {
    const container = document.getElementById("knives");
    container.replaceChildren();

    for (const position of knifePositions) {
        const knife = document.createElement("div");
        knife.className = "knife " + position;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "knife-hitbox";
        button.setAttribute("aria-label", "Pull knife out: " + position.replaceAll("-", " "));
        knife.appendChild(button);
        container.appendChild(knife);
    }
}

function setKnivesEnabled(enabled) {
    for (const button of document.querySelectorAll(".knife-hitbox")) {
        button.disabled = !enabled;
    }
}
