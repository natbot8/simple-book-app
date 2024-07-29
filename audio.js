let audioContext;
let currentAudio = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function fadeOutAudio(audio, duration = 1) {
    if (!audioContext) return;

    if (!audio.source) {
        audio.source = audioContext.createMediaElementSource(audio);
    }

    if (!audio.gainNode) {
        audio.gainNode = audioContext.createGain();
        audio.source.connect(audio.gainNode);
        audio.gainNode.connect(audioContext.destination);
    }

    audio.gainNode.gain.setValueAtTime(audio.gainNode.gain.value, audioContext.currentTime);
    audio.gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    }, duration * 1000);
}

function fadeInAudio(audio, duration = 1) {
    if (!audioContext) return;

    if (!audio.source) {
        audio.source = audioContext.createMediaElementSource(audio);
    }

    if (!audio.gainNode) {
        audio.gainNode = audioContext.createGain();
        audio.source.connect(audio.gainNode);
        audio.gainNode.connect(audioContext.destination);
    }

    audio.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    audio.play();
    audio.gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + duration);
}

function toggleSound() {
    initAudioContext();
    isSoundOn = !isSoundOn;
    soundControlIcons.forEach(icon => {
        icon.src = isSoundOn ? 'images/sound-on.png' : 'images/sound-off.png';
    });

    if (isSoundOn) {
        playAudioForCurrentScreen();
    } else {
        if (currentAudio) {
            fadeOutAudio(currentAudio);
        }
    }
}

function playAudioForCurrentScreen() {
    if (!isSoundOn) return;

    initAudioContext();

    const newAudio = getCurrentScreenAudio();

    if (currentAudio && currentAudio !== newAudio) {
        fadeOutAudio(currentAudio);
    }

    if (newAudio && newAudio !== currentAudio) {
        fadeInAudio(newAudio);
    }

    currentAudio = newAudio;
}

function getCurrentScreenAudio() {
    switch (currentScreen) {
        case 'home':
            return homeAudio;
        case 'end':
            return endAudio;
        default:
            return null;
    }
}

document.addEventListener('click', initAudioContext, { once: true });

function updateCurrentScreen(screen) {
    currentScreen = screen;
    console.log('Current screen:', currentScreen);
    playAudioForCurrentScreen();
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (currentAudio) {
            currentAudio.pause();
        }
    } else {
        playAudioForCurrentScreen();
    }
});