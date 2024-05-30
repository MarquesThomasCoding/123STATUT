//? Variables

const musics = ["dancing_music_1.mp3", "dancing_music_2.mp3", "dancing_music_3.mp3"];
const cocoDances = ["dancing_coco_1.gif", "dancing_coco_2.gif"];
const statueSounds = ["statue_sound_1.mp3", "statue_sound_2.mp3", "statue_sound_3.mp3", "statue_sound_4.mp3", "statue_sound_5.mp3", "statue_sound_6.mp3"];

let audio, audioStatueSound, audioReaction, danceTimeout, statueTimeout, changeStatueTimeout, progressBarInterval;
const totalTime = 60;

const homeSection = document.querySelector(".home-section");
const gameSection = document.querySelector(".game-section");
const coco = document.querySelector("#coco");
const overlaysContainer = document.querySelector(".overlays");
const pauseGameOverlay = document.querySelector(".overlay-pause");
const resultsOverlay = document.querySelector(".overlay-results");
const progressBar = document.querySelector("#progress-bar");


//? Utils functions

const fetchJson = (url) => fetch(url).then(response => response.json());

const getRandomDuration = () => {return Math.floor(Math.random() * (8000 - 5000) + 5000)};

const saveTimePlayed = (time) => localStorage.setItem('timePlayed', JSON.stringify({time: parseInt(time), date: Date.now()}) + getTimePlayed());

const getTimePlayed = () => localStorage.getItem('timePlayed') || JSON.stringify({time: 0, date: Date.now()});

const getAllTimePlayed = () => {
    const dataString = getTimePlayed();

    const objectStrings = dataString.match(/\{[^}]+\}/g);

    const total = objectStrings.reduce((acc, objString) => {
        const obj = JSON.parse(objString);
        return acc + obj.time;
    }, 0);

    return total;
};

const convertTimeToMinSec = (time) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min} m et ${sec} s`
}

const getTimePlayedPerDay = () => {
    const dataString = getTimePlayed();

    const objectStrings = dataString.match(/\{[^}]+\}/g);

    const data = objectStrings.reduce((acc, objString) => {
        const obj = JSON.parse(objString);
        const date = new Date(obj.date);
        const day = date.getDate();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const key = `${day}/${month}/${year}`;
        if (acc[key]) {
            acc[key] += obj.time;
        } else {
            acc[key] = obj.time;
        }
        return acc;
    }, {});

    const tableStats = document.querySelector(".results-table tbody");

    Object.entries(data).forEach(([date, time]) => {
        const newRow = document.createElement("tr");

        const dateCell = document.createElement("td");
        const timeCell = document.createElement("td");

        dateCell.textContent = date;
        timeCell.textContent = convertTimeToMinSec(time);

        newRow.appendChild(dateCell);
        newRow.appendChild(timeCell);

        tableStats.appendChild(newRow);
    });
}

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
    clearTimeout(changeStatueTimeout);
}


const setCurrentPhase = (phase) => localStorage.setItem('currentPhase', phase);

const getCurrentPhase = () => localStorage.getItem('currentPhase') || "dance";

const clearCurrentPhase = () => localStorage.removeItem('currentPhase');

const setUIDance = () => {
    coco.src = '/imgs/'+cocoDances[Math.floor(Math.random() * cocoDances.length)];
    document.querySelector(".coco-area").style.backgroundColor = "var(--yellow)";
}

const setUIStatue = () => {
    coco.src = "/imgs/coco_statue.png";
    document.querySelector(".coco-area").style.backgroundColor = "lightgray";
}


//? Fonctions pour l'audio

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

const stopAudios = () => {
    if (audioStatueSound) {
        audioStatueSound.pause();
        audioStatueSound.currentTime = 0;
    }
    if (audioReaction) {
        audioReaction.pause();
        audioReaction.currentTime = 0;
    }
}


//? Fonction pour les encouragements

const getRandomReaction = (phase) => {
    fetchJson('/audio_coach_reaction/coach_reaction.json')
    .then(data => {
        const encouragements = data[phase === "end" ? 'end_game_congratulations' : 'in_game_encouragement'];
        const allReactions = Object.entries(encouragements).flatMap(([category, reactions]) => 
            (phase === "dance" && category !== "follow_music") || (phase === "statue" && category === "follow_music") ? reactions : []
        );
        const randomReaction = allReactions[Math.floor(Math.random() * allReactions.length)];
        if (randomReaction) {
            audioReaction = new Audio(`/audio_coach_reaction/${randomReaction}.mp3`);
            audioReaction.play();
        }
    });
};

const getRandomStatueSound = () => {
    audioStatueSound = new Audio('/audios/'+statueSounds[Math.floor(Math.random() * statueSounds.length)]);
    audioStatueSound.play();
}


//? Fonction pour la barre de progression

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


//? Fonctions de changement de phase

const changeToStatue = () => {
    setCurrentPhase("statue");
    getRandomStatueSound();
    changeStatueTimeout = setTimeout(() => {
        setUIStatue();
        stopMusic();
        getRandomReaction("statue");
    }, 3000);
};

const returnToDance = () => {
    setCurrentPhase("dance");
    getRandomReaction("dance");
    setUIDance();
    playMusic();
    danceTimeout = setTimeout(() => {
        changeToStatue();
        statueTimeout = setTimeout(returnToDance, getRandomDuration());
    }, getRandomDuration());
};


//? Fonctions de jeu

const resumeGame = () => {
    const remainingTime = parseInt(localStorage.getItem('remainingTime')) || totalTime;

    overlaysContainer.style.display = "none";
    pauseGameOverlay.style.display = "none";
    resultsOverlay.style.display = "none";

    updateProgressBar(remainingTime);

    if(getCurrentPhase() === "dance") {
        playMusic();
        danceTimeout = setTimeout(() => {
            changeToStatue();
            statueTimeout = setTimeout(returnToDance, getRandomDuration());
        }, getRandomDuration());
    }
    else {
        setUIStatue();
        statueTimeout = setTimeout(returnToDance, getRandomDuration());
    }
}

const startGame = () => {
    setCurrentPhase("dance");
    homeSection.classList.add("hidden");
    gameSection.classList.remove("hidden");
    const remainingTime = parseInt(localStorage.getItem('remainingTime')) || totalTime;

    overlaysContainer.style.display = "none";
    pauseGameOverlay.style.display = "none";
    resultsOverlay.style.display = "none";

    updateProgressBar(remainingTime);
    returnToDance();
};

const stopGame = () => {
    saveTimePlayed(totalTime);
    clearRemainingTime();
    stopMusic();
    stopAudios();
    clearAll();
    getRandomReaction("end");
    getTimePlayedPerDay();
    setCurrentPhase("dance");

    overlaysContainer.style.display = "grid";
    resultsOverlay.style.display = "grid";
    const timePlayed = getAllTimePlayed();
    document.querySelector("#game-time").textContent = convertTimeToMinSec(timePlayed);
};

const pauseGame = () => {
    setRemainingTime(getRemainingTime());
    
    stopMusic();
    stopAudios();
    clearAll();

    overlaysContainer.style.display = "grid";
    pauseGameOverlay.style.display = "grid";
};

const quitGame = () => {
    clearRemainingTime();
    clearCurrentPhase();
    saveTimePlayed(totalTime - getRemainingTime());
    homeSection.classList.remove("hidden");
    gameSection.classList.add("hidden");
}