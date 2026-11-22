/**
 * Inline script run in <head> before the page paints: applies the saved theme
 * ("light" = morning, "dark" = evening) or, the first time, the phone setting.
 * Avoids a flash of the wrong colors on load.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}})();`;
