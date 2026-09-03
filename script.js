const el = document.querySelector(".typing");
const API_URL = "https://api.adviceslip.com/advice";

let text = "";
let current = [];
let j = 0;
let isDeleting = false;
let isEnd = false;

async function fetchAdvice() {
    try {
        const res = await fetch(API_URL, { cache: "no-cache" }); // prevent caching
        const data = await res.json();
        return data.slip.advice;
    } catch (e) {
        console.error("API error:", e);
        return "Could not fetch advice.";
    }
}

async function startTyping() {
    text = await fetchAdvice();
    j = 0;
    current = [];
    loop();
}

async function loop() {
    isEnd = false;
    el.innerHTML = current.join("");

    if (!isDeleting && j <= text.length) {
        current.push(text[j]);
        j++;
        el.innerHTML = current.join("");
    }

    if (isDeleting && j <= text.length) {
        current.pop();
        j--;
        el.innerHTML = current.join("");
    }

    if (j === text.length) {
        isEnd = true;
        isDeleting = true;
    }

    if (isDeleting && j === 0) {
        current = [];
        isDeleting = false;
        text = await fetchAdvice(); // get a new advice
        j = 0;
    }

    const speedUp = Math.random() * (80 - 50) + 50;
    const normalSpeed = Math.random() * (200 - 100) + 100;
    const time = isEnd ? 1500 : isDeleting ? speedUp : normalSpeed;
    setTimeout(loop, time);
}

startTyping();