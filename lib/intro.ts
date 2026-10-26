export const INTRO_KEY = "nickode-intro";

/* Runs inline in <head>, before first paint (DESIGN.md 6). It marks the page
   <html data-intro> when the intro should play, so the full-screen overlay is
   already covering the page in the very first frame: once per visit, on the home
   page only, not when the visit is aimed at a section (#hash) or the page is
   restored part-way down. */
export const introInitScript = `(function(){try{var d=document.documentElement;if(location.pathname==="/"&&!location.hash&&!window.scrollY&&!sessionStorage.getItem("${INTRO_KEY}")){d.setAttribute("data-intro","")}}catch(e){}})()`;
