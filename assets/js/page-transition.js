const supportsViewTransition = 'startViewTransition' in document;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');

    if (!link || link.target === '_blank' || link.origin !== window.location.origin) {
        return;
    }

    const destination = new URL(link.href);

    if (destination.pathname === window.location.pathname && destination.hash) {
        return;
    }

    if (supportsViewTransition || prefersReducedMotion) {
        return;
    }

    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => {
        window.location.href = link.href;
    }, 320);
});