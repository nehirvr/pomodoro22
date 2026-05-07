const timerDisplay = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeLabel = document.getElementById('mode-label');
const progressCircle = document.getElementById('progress');
const customTimeInput = document.getElementById('custom-time');

let WORK_TIME = parseInt(customTimeInput.value) * 60;
let timeLeft = WORK_TIME;
let timerInterval = null;
let isRunning = false;

// Progress circle setup
const radius = progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = 0;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update document title
    document.title = `${timerDisplay.textContent} - Pomodoro`;
    
    // Update progress ring
    const percent = (timeLeft / WORK_TIME) * 100;
    setProgress(percent);
}

function playNotificationSound() {
    // Note: AudioContext needs to be created or resumed after a user gesture
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = window.audioCtx;
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    
    // Play an alarm-like sound
    const playTone = (frequency, startTime, duration, type='sine') => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(ctx.currentTime + startTime);
        oscillator.stop(ctx.currentTime + startTime + duration);
    };

    // Alarm beeps
    playTone(800, 0, 0.3, 'square');
    playTone(800, 0.4, 0.3, 'square');
    playTone(800, 0.8, 0.3, 'square');
    playTone(800, 1.2, 0.8, 'square');
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.textContent = 'Pause';
    startBtn.classList.add('paused');
    modeLabel.textContent = 'Focusing...';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            playNotificationSound();
            startBtn.textContent = 'Start';
            startBtn.classList.remove('paused');
            modeLabel.textContent = 'Session Complete!';
            timeLeft = 0;
            updateDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Resume';
    startBtn.classList.remove('paused');
    modeLabel.textContent = 'Paused';
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    WORK_TIME = parseInt(customTimeInput.value) * 60;
    if (isNaN(WORK_TIME) || WORK_TIME <= 0) {
        WORK_TIME = 25 * 60; // fallback
        customTimeInput.value = 25;
    }
    timeLeft = WORK_TIME;
    updateDisplay();
    startBtn.textContent = 'Start';
    startBtn.classList.remove('paused');
    modeLabel.textContent = 'Time to focus';
}

// Event Listeners
customTimeInput.addEventListener('change', () => {
    if (!isRunning) {
        resetTimer();
    }
});

startBtn.addEventListener('click', () => {
    // Initialize AudioContext on first user interaction if not exists
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

// Initial display
updateDisplay();
