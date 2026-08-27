const themeToggle = document.querySelector('#theme-toggle');
const storedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
	document.documentElement.dataset.theme = theme;
	themeToggle.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
	themeToggle.setAttribute('title', theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
	document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
setTheme(initialTheme);

themeToggle.addEventListener('click', () => {
	const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
	localStorage.setItem('theme', nextTheme);
	setTheme(nextTheme);
});
