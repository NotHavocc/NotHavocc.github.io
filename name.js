const text = document.getElementById("text");
const textbox = document.getElementById("textbox");

function changeText(){
    const colorbox = document.getElementById("id03").value;
    const animations = document.getElementById("animations").value;

    console.log(colorbox);
    text.innerHTML = textbox.value;
    text.style.color = colorbox;

    if(animations == "wobble"){
        text.style.setProperty("--animation", "wobble 2s ease 0s infinite normal forwards");
    } else if(animations == "none") {
        text.style.setProperty("--animation", "none");
    } else if(animations == "blink"){
        text.style.setProperty("--animation", "blink 2s ease 0s infinite normal forwards");
    } else if(animations == "pulse"){
    text.style.setProperty("--animation", "pulse2 2s ease 0s infinite normal forwards");
    } else if(animations == "jelly"){
        text.style.setProperty("--animation", "jello 2s ease 0s infinite normal forwards");
    } else if(animations == "heartbeat"){
        text.style.setProperty("--animation", "heartbeat 2s ease 0s infinite normal forwards");
    }
}






