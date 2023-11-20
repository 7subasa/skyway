let startTime = 0;
let elapsedTime = 0;
let intervalId = null;

// 表示更新
function updateDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const milliseconds = parseInt((elapsedTime % 1000) / 10, 10);
    const displayTime = `${totalSeconds}.${milliseconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').innerText = displayTime;
    document.getElementById('current-time').innerText = new Date().toLocaleTimeString();
}

// タイマースタート
function startTimer() {
    if (intervalId === null) {
        startTime = Date.now() - elapsedTime;
        intervalId = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10); 
    }
}

// タイマーストップ
function stopTimer() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// 表示クリア
function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateDisplay();
}

// 現在時刻の初期表示と定期的な更新
updateDisplay();
setInterval(updateDisplay, 1000);
