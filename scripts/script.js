let playing = false;
const audio = new Audio('/audios/instruction_follow_music.mp3');

const playConsignes = () => {
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
    }, audio.duration * 1000);
}