const targets = document.querySelectorAll(".card, .dot-nav a, a, .theme-toggle, input, button, textarea");
const cursor = document.querySelector('.custom-cursor');
const supportsMagneticCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const magneticThreshold = 32;
const magneticHysteresis = 8;

if (!supportsMagneticCursor || !cursor) {
    cursor?.remove();
} else {

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let magneticTarget = null;

const factor = 0.1;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function findMagneticTarget(x, y) {
    let closestTarget = null;
    let closestDistance = Infinity;

    targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const closestX = Math.max(rect.left, Math.min(x, rect.right));
        const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
        const distance = Math.hypot(x - closestX, y - closestY);

        if (distance < magneticThreshold && distance < closestDistance) {
            closestTarget = target;
            closestDistance = distance;
        }
    });

    return closestTarget;
}

window.addEventListener('click', (event) => {
    const clickedInteractive = event.target instanceof Element
        ? event.target.closest('button, a, input, textarea')
        : null;
    
    // 既にインタラクティブ要素をクリックしていたら、磁気ターゲットを探さない
    if (clickedInteractive) {
        return;
    }

    // マグネティックターゲットが存在する場合、それをクリック
    if (magneticTarget instanceof HTMLElement) {
        magneticTarget.click();
        return;
    }

    // 磁気ターゲットがなければ、最も近い要素を探す
    const clickedTarget = findMagneticTarget(event.clientX, event.clientY);
    if (!(clickedTarget instanceof HTMLElement)) {
        return;
    }

    if (clickedTarget.matches('button, input, textarea')) {
        clickedTarget.click();
        return;
    }

    if (!(clickedTarget instanceof HTMLAnchorElement)) {
        return;
    }

    if (!clickedTarget.matches('.dot-nav a')) {
        clickedTarget.click();
        return;
    }

    const targetId = clickedTarget.getAttribute('href')?.slice(1);
    const targetSection = targetId ? document.getElementById(targetId) : null;

    if (!targetSection) {
        return;
    }

    event.preventDefault();
    history.pushState(null, '', `#${targetId}`);
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// render() ループ内で全要素との距離を計算するアプローチ
function render() {
    let targetX = mouseX;
    let targetY = mouseY;
    let closestTarget = null;
    let closestDistance = Infinity;
    const threshold = magneticThreshold;

    targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
        const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));

        // ポインターと要素の矩形との最短距離を計算
        const distance = Math.hypot(mouseX - closestX, mouseY - closestY);

        // 一番近い要素かつ、しきい値以内なら吸着対象にする
        if (distance < threshold && distance < closestDistance) {
            closestTarget = target;
            closestDistance = distance;
        }
    });

    if (magneticTarget && magneticTarget !== closestTarget) {
        const rect = magneticTarget.getBoundingClientRect();
        const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
        const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
        const currentDistance = Math.hypot(mouseX - closestX, mouseY - closestY);

        if (currentDistance <= magneticThreshold
            && currentDistance <= closestDistance + magneticHysteresis) {
            closestTarget = magneticTarget;
        }
    }

    if (magneticTarget !== closestTarget) {
        magneticTarget?.classList.remove('is-magnetic-hover');
        magneticTarget = closestTarget;
        magneticTarget?.classList.add('is-magnetic-hover');
    }

    if (closestTarget) {
        const rect = closestTarget.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;

        cursor.style.width = `${rect.width + 10}px`;
        cursor.style.height = `${rect.height + 10}px`;
        cursor.style.borderRadius = window.getComputedStyle(closestTarget).borderRadius;
    } else {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.borderRadius = '50%';
    }

    currentX += (targetX - currentX) * factor;
    currentY += (targetY - currentY) * factor;

    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(render);
}

render();
}