//? Variables

// Audios et gifs
const musics = ["dancing_music_1.mp3", "dancing_music_2.mp3", "dancing_music_3.mp3"];
const coco_dances = ["dancing_coco_1.gif", "dancing_coco_2.gif"];

// Variables de jeu
let audio, danceTimeout, statueTimeout, progressBarInterval;
const totalTime = 60;

// DOM elements
const coco = document.querySelector("#coco");
const overlaysContainer = document.querySelector(".overlays");
const pauseGameOverlay = document.querySelector(".overlay-pause");
const resultsOverlay = document.querySelector(".overlay-results");
const progressBar = document.querySelector("#progress-bar");

//? Utils functions

// Fonction pour fetcher un fichier json
const fetchJson = (url) => fetch(url).then(response => response.json());

// Fonction pour obtenir une durée aléatoire entre 3 et 6 secondes
const getRandomDuration = () => {return Math.floor(Math.random() * (6000 - 3000) + 3000)};

// Fonction pour sauvegarder le temps joué
const saveTimePlayed = (time) => localStorage.setItem('timePlayed', parseInt(time));
// Fonction pour obtenir le temps joué
const getTimePlayed = () => {return parseInt(localStorage.getItem('timePlayed')) || 0};

// Fonction pour définir le temps restant
const setRemainingTime = (time) => localStorage.setItem('remainingTime', parseInt(time));
// Fonction pour obtenir le temps restant en fonction de la largeur de la progress bar
const getRemainingTime = () => {
    const progressBarWidth = progressBar.offsetWidth;
    const totalWidth = progressBar.parentNode.offsetWidth;

    const percentageProgress = (progressBarWidth / totalWidth) * 100;
    const remainingTime = (percentageProgress / 100) * totalTime;

    return remainingTime;
};
// Fonction pour effacer le temps restant
const clearRemainingTime = () => localStorage.removeItem('remainingTime');

// Fonction pour arrêter tous les timeouts et intervals
const clearAll = () => {
    clearInterval(progressBarInterval);
    clearTimeout(danceTimeout);
    clearTimeout(statueTimeout);
}

// Fonction pour définir la phase actuelle
const setCurrentPhase = (phase) => localStorage.setItem('currentPhase', phase);
// Fonction pour obtenir la phase actuelle
const getCurrentPhase = () => localStorage.getItem('currentPhase') || "dance";
// Fonction pour effacer la phase actuelle
const clearCurrentPhase = () => localStorage.removeItem('currentPhase');

//? Fonctions pour la musique
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

// Fonction pour obtenir une réaction aléatoire du coach
const getRandomReaction = (phase) => {
    // Fetch le fichier json contenant les encouragements
    fetchJson('/audio_coach_reaction/coach_reaction.json')
    .then(data => {
        // Récupère les encouragements en fonction de la phase
        const encouragements = data[phase === "end" ? 'end_game_congratulations' : 'in_game_encouragement'];
        // Stocke tous les encouragements dans un tableau en les filtrant en fonction de la phase / categorie
        const allReactions = Object.entries(encouragements).flatMap(([category, reactions]) => 
            (phase === "dance" && category !== "follow_music") || (phase === "statue" && category === "follow_music") ? reactions : []
        );
        // Récupère une réaction aléatoire
        const randomReaction = allReactions[Math.floor(Math.random() * allReactions.length)];
        if (randomReaction) {
            // Joue la réaction
            const audioReaction = new Audio(`/audio_coach_reaction/${randomReaction}.mp3`);
            audioReaction.play();
        }
    });
};

// Fonction pour mettre à jour la barre de progression de la partie
const updateProgressBar = (remainingTime) => {
    const progressBarWidth = (remainingTime / totalTime) * 100;

    let duration = remainingTime;
    progressBar.style.width = `${progressBarWidth}%`;

    // Met à jour la barre de progression toutes les secondes
    progressBarInterval = setInterval(() => {
        duration -= 1;
        const progressBarWidth = (duration / totalTime) * 100;
        progressBar.style.width = `${progressBarWidth}%`;
        // Arrête la partie si le temps est écoulé
        if (duration <= 0) {
            progressBar.style.width = "0%";
            clearInterval(progressBarInterval);
            stopGame();
        }
    }, 1000);
};

//? Fonctions de changement de phase

// Fonction pour changer la phase en statue
const changeToStatue = () => {
    setCurrentPhase("statue");
    coco.src = "/imgs/coco_statue.png";
    document.querySelector(".coco-area").style.backgroundColor = "lightgray";
    stopMusic();
    getRandomReaction("statue");
};

// Fonction pour retourner à la phase de danse
const returnToDance = () => {
    setCurrentPhase("dance");
    getRandomReaction("dance");
    coco.src = '/imgs/'+coco_dances[Math.floor(Math.random() * coco_dances.length)];
    playMusic();
    document.querySelector(".coco-area").style.backgroundColor = "var(--yellow)";
    danceTimeout = setTimeout(() => {
        changeToStatue();
        statueTimeout = setTimeout(returnToDance, getRandomDuration());
    }, getRandomDuration());
};

//? Fonctions de jeu

// Fonction pour obtenir la partie
const getGame = () => {
    const remainingTime = parseInt(localStorage.getItem('remainingTime')) || 60;

    overlaysContainer.style.display = "none";
    pauseGameOverlay.style.display = "none";
    resultsOverlay.style.display = "none";

    updateProgressBar(remainingTime);

    // Lance la phase de statue après un temps aléatoire
    danceTimeout = setTimeout(() => {
        changeToStatue();
        // Lance la phase de danse après un temps aléatoire
        statueTimeout = setTimeout(returnToDance, getRandomDuration());
    }, getRandomDuration());
}

// Fonction pour démarrer la partie
const startGame = () => {
    playMusic();
    getGame();
};

// Fonction pour arrêter la partie
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

// Fonction pour mettre en pause la partie
const pauseGame = () => {
    setRemainingTime(getRemainingTime());
    
    stopMusic();
    clearAll();

    overlaysContainer.style.display = "grid";
    pauseGameOverlay.style.display = "grid";
};

// Fonction pour reprendre la partie
const resumeGame = () => {
    const phase = getCurrentPhase();
    if(phase === "dance") return startGame();
    getGame();
}

// Fonction pour quitter la partie
const quitGame = () => {
    clearRemainingTime();
    clearCurrentPhase();
    saveTimePlayed(getTimePlayed() + (60 - getRemainingTime()));
    window.location.href = "/";
}

// Démarre la partie
setCurrentPhase("dance");
startGame();