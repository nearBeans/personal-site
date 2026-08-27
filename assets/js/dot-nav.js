const main = document.querySelector('main');
const sections = [...document.querySelectorAll('main .area')];
const dotLinks = [...document.querySelectorAll('.dot-nav a')];

function updateActiveDot() {
    const mainRect = main.getBoundingClientRect();
    let activeSection = null;
    let largestVisibleArea = 0;

    sections.forEach((section) => {
        const sectionRect = section.getBoundingClientRect();
        const visibleTop = Math.max(sectionRect.top, mainRect.top);
        const visibleBottom = Math.min(sectionRect.bottom, mainRect.bottom);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);

        if (visibleArea > largestVisibleArea) {
            largestVisibleArea = visibleArea;
            activeSection = section;
        }
    });

    dotLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${activeSection?.id}`;
        link.classList.toggle('is-active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

main.addEventListener('scroll', updateActiveDot, { passive: true });
window.addEventListener('resize', updateActiveDot, { passive: true });
updateActiveDot();