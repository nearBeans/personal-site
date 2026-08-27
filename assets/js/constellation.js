const algorithmCanvas = document.querySelector('#algorithm-canvas');
const algorithmContext = algorithmCanvas.getContext('2d');
const startButton = document.querySelector('#algorithm-start');
const resetButton = document.querySelector('#algorithm-reset');
const countLabel = document.querySelector('#algorithm-count');
const messageLabel = document.querySelector('#algorithm-message');
const algorithmChoices = document.querySelectorAll('.algorithm-choice');
const originalValues = [42, 18, 67, 9, 35, 81, 24, 56, 13, 73, 29, 61];
let values = [...originalValues];
let selectedAlgorithm = 'bubble';
let operations = [];
let operationIndex = 0;
let comparisonCount = 0;
let currentIndex = -1;
let secondaryIndex = -1;
let timerId = null;
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;

function resizeAlgorithm() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = algorithmCanvas.clientWidth;
    canvasHeight = algorithmCanvas.clientHeight;
    algorithmCanvas.width = canvasWidth * pixelRatio;
    algorithmCanvas.height = canvasHeight * pixelRatio;
    algorithmContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawAlgorithm();
}

function drawAlgorithm() {
    const styles = getComputedStyle(document.documentElement);
    const borderColor = styles.getPropertyValue('--border-color').trim();
    const accentColor = styles.getPropertyValue('--heading1-colour').trim();
    const barGap = 6;
    const barWidth = (canvasWidth - barGap * (values.length + 1)) / values.length;
    const maxValue = Math.max(...values);

    algorithmContext.clearRect(0, 0, canvasWidth, canvasHeight);
    values.forEach((value, index) => {
        const height = (value / maxValue) * (canvasHeight - 34);
        const x = barGap + index * (barWidth + barGap);
        const y = canvasHeight - height - 16;
        const isComparing = index === currentIndex || index === secondaryIndex;
        algorithmContext.fillStyle = isComparing ? accentColor : borderColor;
        algorithmContext.globalAlpha = isComparing ? 1 : 0.52;
        algorithmContext.fillRect(x, y, barWidth, height);
        algorithmContext.fillStyle = borderColor;
        algorithmContext.globalAlpha = 0.72;
        algorithmContext.font = '11px Lexend, sans-serif';
        algorithmContext.textAlign = 'center';
        algorithmContext.fillText(value, x + barWidth / 2, canvasHeight - 3);
    });
    algorithmContext.globalAlpha = 1;
}

function updateStatus() {
    countLabel.textContent = `比較 ${comparisonCount}`;
    messageLabel.textContent = timerId ? `${selectedAlgorithm === 'bubble' ? 'バブルソート' : 'クイックソート'}を実行中` : 'スタートすると実行します';
}

function finishAlgorithm() {
    window.clearInterval(timerId);
    timerId = null;
    currentIndex = -1;
    startButton.textContent = 'もう一度';
    messageLabel.textContent = '整列完了。きれいになった！';
    drawAlgorithm();
}

function stepAlgorithm() {
    if (operationIndex >= operations.length) {
        finishAlgorithm();
        return;
    }
    const operation = operations[operationIndex];
    currentIndex = operation.index;
    secondaryIndex = operation.secondaryIndex;
    if (operation.type === 'compare') {
        comparisonCount += 1;
    } else {
        [values[operation.index], values[operation.secondaryIndex]] = [values[operation.secondaryIndex], values[operation.index]];
    }
    operationIndex += 1;
    updateStatus();
    drawAlgorithm();
}

function startAlgorithm() {
    if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
        startButton.textContent = '再開';
        updateStatus();
        return;
    }
    if (operationIndex >= operations.length) resetAlgorithm();
    startButton.textContent = '一時停止';
    timerId = window.setInterval(stepAlgorithm, 260);
    updateStatus();
}

function resetAlgorithm() {
    window.clearInterval(timerId);
    timerId = null;
    values = [...originalValues].sort(() => Math.random() - 0.5);
    operations = createOperations(values, selectedAlgorithm);
    operationIndex = 0;
    comparisonCount = 0;
    currentIndex = -1;
    secondaryIndex = -1;
    startButton.textContent = 'スタート';
    updateStatus();
    drawAlgorithm();
}

function createOperations(sourceValues, algorithm) {
    const simulation = [...sourceValues];
    const result = [];
    const compare = (index, secondaryIndex) => result.push({ type: 'compare', index, secondaryIndex });
    const swap = (index, secondaryIndex) => {
        result.push({ type: 'swap', index, secondaryIndex });
        [simulation[index], simulation[secondaryIndex]] = [simulation[secondaryIndex], simulation[index]];
    };

    if (algorithm === 'bubble') {
        for (let end = simulation.length - 1; end > 0; end--) {
            for (let index = 0; index < end; index++) {
                compare(index, index + 1);
                if (simulation[index] > simulation[index + 1]) swap(index, index + 1);
            }
        }
        return result;
    }

    function quickSort(start, end) {
        if (start >= end) return;
        const pivot = simulation[end];
        let boundary = start;
        for (let index = start; index < end; index++) {
            compare(index, end);
            if (simulation[index] < pivot) {
                if (index !== boundary) swap(index, boundary);
                boundary += 1;
            }
        }
        if (boundary !== end) swap(boundary, end);
        quickSort(start, boundary - 1);
        quickSort(boundary + 1, end);
    }
    quickSort(0, simulation.length - 1);
    return result;
}

function selectAlgorithm(event) {
    selectedAlgorithm = event.currentTarget.dataset.algorithm;
    algorithmChoices.forEach((choice) => {
        const isSelected = choice === event.currentTarget;
        choice.classList.toggle('is-selected', isSelected);
        choice.setAttribute('aria-pressed', isSelected);
    });
    resetAlgorithm();
}

startButton.addEventListener('click', startAlgorithm);
resetButton.addEventListener('click', resetAlgorithm);
algorithmChoices.forEach((choice) => choice.addEventListener('click', selectAlgorithm));
window.addEventListener('resize', resizeAlgorithm);
document.addEventListener('themechange', drawAlgorithm);
resizeAlgorithm();
resetAlgorithm();
updateStatus();