let playing = false;
const audio = new Audio('/audios/instruction_follow_music.mp3');
const playMusicBtn = document.querySelector("#play-btn");

const playConsignes = (btn) => {
    if (!playing) {
        audio.play();
        playing = true;
    } else {
        if (audio.paused) {
            audio.play();
        }
        else {
            audio.pause();
        }
    }
    setTimeout(() => {
        playing = false;
        playMusicBtn.querySelector(".fi-sr-play").classList.remove("hidden");
        playMusicBtn.querySelector(".fi-sr-pause").classList.add("hidden");
    }, audio.duration * 1000);
}

playMusicBtn.addEventListener("click", () => {
    playConsignes();
    playMusicBtn.querySelector(".fi-sr-play").classList.toggle("hidden");
    playMusicBtn.querySelector(".fi-sr-pause").classList.toggle("hidden");
});