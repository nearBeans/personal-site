const canvas = document.querySelector('#easter-egg-canvas');
const context = canvas.getContext('2d');
const section = canvas.closest('section');
const displayNameHeading = document.querySelector('.dname-heading');
const stars = [];
const sparks = [];
let clickTimes = [];
let unlocked = false;
let width = 0;
let height = 0;
let pixelRatio = 1;
let canvasBackground = '#eee';
let canvasForeground = '#4d4d4d';

function updateCanvasColors() {
    const styles = getComputedStyle(document.documentElement);
    canvasBackground = styles.getPropertyValue('--backcolor').trim();
    canvasForeground = styles.getPropertyValue('--border-color').trim();
}

function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (stars.length === 0) {
        for (let index = 0; index < 90; index++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
}

function addSpark(x, y) {
    for (let index = 0; index < 18; index++) {
        const angle = (Math.PI * 2 * index) / 18;
        const speed = Math.random() * 2 + 1;
        sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 2 + 1
        });
    }
}

function unlock() {
    unlocked = true;
    section.dataset.secret = 'unlocked';
    const headingLink = document.createElement('a');
    headingLink.href = 'easteregg.html';
    headingLink.className = displayNameHeading.className;
    headingLink.classList.add('easter-egg-link');
    headingLink.append(...displayNameHeading.childNodes);
    displayNameHeading.replaceWith(headingLink);
    for (let index = 0; index < 5; index++) {
        addSpark(width / 2, height / 2);
    }
}

function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = canvasBackground;
    context.fillRect(0, 0, width, height);

    stars.forEach((star) => {
        const glow = 0.25 + (Math.sin(performance.now() / 900 + star.phase) + 1) * 0.2;
        context.fillStyle = `color-mix(in srgb, ${canvasForeground} ${glow * 100}%, transparent)`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
    });

    sparks.forEach((spark) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.98;
        spark.vy *= 0.98;
        spark.life -= 0.018;
        context.fillStyle = `color-mix(in srgb, ${canvasForeground} ${Math.max(spark.life, 0) * 100}%, transparent)`;
        context.fillRect(spark.x, spark.y, spark.size, spark.size);
    });

    for (let index = sparks.length - 1; index >= 0; index--) {
        if (sparks[index].life <= 0) {
            sparks.splice(index, 1);
        }
    }
    
    if (unlocked) {
        context.fillStyle = canvasForeground;
        context.font = '600 14px Lexend, sans-serif';
        context.textAlign = 'center';

        let text = "secret unlocked:\nHello, World! This is mofh.dev!";
        let lines = text.split('\n');
        let lineHeight = 20; // 14pxの文字に対して適切な行間（20px）を設定

        // 全体の高さの半分を計算し、文字全体が上下中央にくるように調整
        let startY = (height / 2) - ((lines.length - 1) * lineHeight / 2);

        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], width / 2, startY + (i * lineHeight));
        }
    }


    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (event) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const now = Date.now();
    clickTimes = clickTimes.filter((time) => now - time < 3000);
    clickTimes.push(now);
    addSpark(x, y);

    if (clickTimes.length >= 7 && !unlocked) {
        unlock();
    }
});

window.addEventListener('resize', resizeCanvas);
document.addEventListener('themechange', updateCanvasColors);
updateCanvasColors();
resizeCanvas();
draw();
