const musics = ["dancing_music_1.mp3", "dancing_music_2.mp3", "dancing_music_3.mp3"];
const coco_dances = ["dancing_coco_1.gif", "dancing_coco_2.gif"];

let audio, danceTimeout, statueTimeout, progressBarInterval;

const coco = document.querySelector("#coco");
const overlaysContainer = document.querySelector(".overlays");
const pauseGameOverlay = document.querySelector(".overlay-pause");
const resultsOverlay = document.querySelector(".overlay-results");
const progressBar = document.querySelector("#progress-bar");

const totalTime = 60;

const fetchJson = (url) => fetch(url).then(response => response.json());
const getRandomDuration = () => {return Math.floor(Math.random() * (8000 - 3000) + 3000)};
const saveTimePlayed = (time) => localStorage.setItem('timePlayed', parseInt(time));
const getTimePlayed = () => {return parseInt(localStorage.getItem('timePlayed')) || 0};
const setRemainingTime = (time) => localStorage.setItem('remainingTime', parseInt(time));
const getRemainingTime = () => {
    const progressBarWidth = progressBar.offsetWidth;
    const totalWidth = progressBar.parentNode.offsetWidth;

    const percentageProgress = (progressBarWidth / totalWidth) * 100;
    const remainingTime = (percentageProgress / 100) * totalTime;

    return remainingTime;
};
const clearRemainingTime = () => localStorage.removeItem('remainingTime');
const clearAll = () => {
    clearInterval(progressBarInterval);
    clearTimeout(danceTimeout);
    clearTimeout(statueTimeout);
}

// Music functions
const setMusic = () => {
    audio = new Audio('/audios/'+musics[Math.floor(Math.random() * musics.length)]);
};

const playMusic = () => {
    setMusic();
    audio.play();
};

const stopMusic = () => {
    audio.pause();
    audio.currentTime = 0;
};

// Reaction function
const getRandomReaction = (phase) => {
    fetchJson('/audio_coach_reaction/coach_reaction.json')
    .then(data => {
        const encouragements = data[phase === "end" ? 'end_game_congratulations' : 'in_game_encouragement'];
        const allReactions = Object.entries(encouragements).flatMap(([category, reactions]) => 
            (phase === "dance" && category !== "follow_music") || (phase === "statue" && category === "follow_music") ? reactions : []
        );
        const randomReaction = allReactions[Math.floor(Math.random() * allReactions.length)];
        if (randomReaction) {
            const audioReaction = new Audio(`/audio_coach_reaction/${randomReaction}.mp3`);
            audioReaction.play();
        }
    });
};

// Progress bar function
const updateProgressBar = (remainingTime) => {
    const progressBarWidth = (remainingTime / totalTime) * 100;

    let duration = remainingTime;
    progressBar.style.width = `${progressBarWidth}%`;

    progressBarInterval = setInterval(() => {
        duration -= 1;
        const progressBarWidth = (duration / totalTime) * 100;
        progressBar.style.width = `${progressBarWidth}%`;
        if (duration <= 0) {
            progressBar.style.width = "0%";
            clearInterval(progressBarInterval);
            stopGame();
        }
    }, 1000);
};

// Game functions
const changeToStatue = () => {
    coco.src = "/imgs/coco_statue.png";
    document.querySelector(".coco-area").style.backgroundColor = "lightgray";
    stopMusic();
    getRandomReaction("statue");
};

const returnToDance = () => {
    getRandomReaction("dance");
    coco.src = '/imgs/'+coco_dances[Math.floor(Math.random() * coco_dances.length)];
    playMusic();
    document.querySelector(".coco-area").style.backgroundColor = "var(--yellow)";
    danceTimeout = setTimeout(() => {
        changeToStatue();
        statueTimeout = setTimeout(returnToDance, getRandomDuration());
    }, getRandomDuration());
};

// Game logic
const startGame = () => {
    const remainingTime = parseInt(localStorage.getItem('remainingTime')) || 60;

    overlaysContainer.style.display = "none";
    pauseGameOverlay.style.display = "none";
    resultsOverlay.style.display = "none";

    playMusic();
    updateProgressBar(remainingTime);

    danceTimeout = setTimeout(() => {
        changeToStatue();
        statueTimeout = setTimeout(returnToDance, getRandomDuration());
    }, getRandomDuration());
};

const stopGame = () => {
    saveTimePlayed(getTimePlayed() + 60);
    clearRemainingTime();
    stopMusic();
    clearAll();
    getRandomReaction("end");

    overlaysContainer.style.display = "grid";
    resultsOverlay.style.display = "grid";
    const timePlayed = getTimePlayed();
    const min = Math.floor(timePlayed / 60);
    const sec = timePlayed % 60;
    document.querySelector("#game-time").textContent = `${min} m et ${sec} s`;
};

const pauseGame = () => {
    setRemainingTime(getRemainingTime());
    
    stopMusic();
    clearAll();

    overlaysContainer.style.display = "grid";
    pauseGameOverlay.style.display = "grid";
};

const quitGame = () => {
    localStorage.removeItem('remainingTime');
    saveTimePlayed(getTimePlayed() + (60 - getRemainingTime()));
    window.location.href = "/";
}

// Start the game
startGame();