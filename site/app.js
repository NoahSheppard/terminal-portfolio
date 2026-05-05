if (window.TerminalApp && typeof window.TerminalApp.init === "function") {
    window.TerminalApp.init();
} else {
    console.error("TerminalApp not available");
}