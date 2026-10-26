export type Theme = "dark" | "light";

export const THEME_KEY = "theme";

/* Runs inline in <head>, before first paint, so the page never flashes the
   wrong theme. A stored choice wins; otherwise follow the OS setting. */
export const themeInitScript = `(function(){var t="dark";try{var s=localStorage.getItem("${THEME_KEY}");if(s==="light"||s==="dark"){t=s}else if(window.matchMedia("(prefers-color-scheme: light)").matches){t="light"}}catch(e){}document.documentElement.setAttribute("data-theme",t)})()`;
