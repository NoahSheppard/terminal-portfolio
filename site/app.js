const term = new Terminal({
    cursorBlink: true,
    fontSize: 15,
    lineHeight: 1.2,
    theme: {
        background: "transparent",
        foreground: "#c8d0d8",
        cursor: "#c8d0d8"
    }
});

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById("terminal"));
fitAddon.fit();
window.addEventListener("resize", () => fitAddon.fit());

const USER = "guest";
const HOST = "noahsh.dev";
const HOME = ["home", USER];
const ANSI = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    white: "\x1b[37m",
    red: "\x1b[31m",
    grey: "\x1b[90m",
    yellow: "\x1b[33m", 
};

const DOOM_SCREEN_WIDTH = 320 * 2;
const DOOM_SCREEN_HEIGHT = 200 * 2;
const DOOM_BLOCK = "▀";
const DOOM_PAD_ROWS = 1;
const DOOM_PAD_COLS = 2;

const FS = {
    type: "dir",
    children: {
        home: {
            type: "dir",
            children: {
                guest: {
                    type: "dir",
                    children: {
                        "about.txt": {
                            type: "file",
                            content: "Hello - I am Noah, a 17-year-old software developer"
                        },
                        "skills.txt": {
                            type: "file",
                            content: "- JavaScript\n- Node.js\n- Web UI\n"
                        },
                        projects: {
                            type: "dir",
                            children: {
                                "bash-portfolio.txt": {
                                    type: "file",
                                    content: "A terminal-style personal site built with xterm.js."
                                },
                                "demo-cli.txt": {
                                    type: "file",
                                    content: "A playful CLI experience with fake commands and output."
                                }
                            }
                        }
                    }
                }
            }
        },
        bin: {
            type: "dir",
            children: {}
        }
    }
};

const neofetchLines = [

    { text: `${ANSI.red}                   >[}}}####}}}[<:              guest${ANSI.reset}@${ANSI.red}noahsh.dev`, delay: 20}, 
    { text: `${ANSI.red}           ]####################[               ----------------`, delay: 20},
    { text: `${ANSI.red}        >}#####}####}##}####}#####})            OS${ANSI.reset}: NOS: Web Edition`, delay: 20},
    { text: `${ANSI.red}      [####}#####}#######}####}######}          Kernel${ANSI.reset}: nosw1.21-prod `, delay: 20},
    { text: `${ANSI.red}    =}###}###}#####}##}##}#####}###}#}          Uptime${ANSI.reset}: Forever and a day `, delay: 20},
    { text: `${ANSI.red}   [###}#######}##})-+}####}#####}##]   :       Packages${ANSI.reset}: None   `, delay: 20},
    { text: `${ANSI.red}  [#######}#####}}-   <######}####}>   *#}      Shell${ANSI.reset}: yes `, delay: 20},
    { text: `${ANSI.red} >##}###}###}###}-   -##}######}#}    <###]     Theme${ANSI.reset}: Custom `, delay: 20},
    { text: `${ANSI.red} #####}###}###}}     #####}####}*    }##}##:    Icons${ANSI.reset}: ASCII `, delay: 20},
    { text: `${ANSI.red}<##}##}#######[     ##}#####}#}    >#######[    Terminal${ANSI.reset}: Web`, delay: 20},
    { text: `${ANSI.red}}#######}##}#*      ##}##}##}    =}###}##}##    CPU${ANSI.reset}: WASM Virtual Core (2.5) @ 67MHz  `, delay: 20},
    { text: `${ANSI.red}##}#}###}##}       +#######     }###}#######    GPU${ANSI.reset}: GT 1030 `, delay: 20},
    { text: `${ANSI.red}}#####}##}}    }   -###}}:    }########}##}#    Memory${ANSI.reset}: 120KiB/640KiB    `, delay: 20},
    { text: `${ANSI.red}<##}##}#}-   =}#}   }#]     }###}##}#######[    `, delay: 20},
    { text: `${ANSI.red} }#####<    }####=        }#########}###}##:    ${ANSI.reset}${"\x1b[30m"}████${"\x1b[31m"}████${"\x1b[32m"}████${"\x1b[33m"}████${"\x1b[34m"}████${"\x1b[35m"}████${"\x1b[36m"}████${"\x1b[37m"}████${ANSI.reset}`, delay: 20},
    { text: `${ANSI.red} >##}[    <##}####>    +}###}##}##}###}###)     ${ANSI.reset}${"\x1b[90m"}████${"\x1b[91m"}████${"\x1b[92m"}████${"\x1b[93m"}████${"\x1b[94m"}████${"\x1b[95m"}████${"\x1b[96m"}████${"\x1b[97m"}████${ANSI.reset}`, delay: 20},
    { text: `${ANSI.red}  [}    -}#####}###}}}#######}###########}      `, delay: 20},
    { text: `${ANSI.red}       }###}}##}#########}######}##}###}}       `, delay: 20},
    { text: `${ANSI.red}     }###########}####}####}##}######}}*        `, delay: 20},
    { text: `${ANSI.red}      ]}##}##}#####}##}##########}}##}          `, delay: 20},
    { text: `${ANSI.red}        >}#####}}######}##}##}####})            `, delay: 20},
    { text: `${ANSI.red}           <}#####}##}##}######}]               `, delay: 20},
    { text: `${ANSI.red}               *[}}}}##}}}}}>                   `, delay: 20}
]

const bootLines = [
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}BIOS 0.1`, delay: 80},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}CPU: WASM Virtual Core @ 67MHz`, delay: 120},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}Memory: 640K ought to be enough ... Right?`, delay: 100},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}Booting from drive C`, delay: 300},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}Starting NOS`, delay: 200},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}HIMEM is testing extended memory ... This isn't DOS`, delay: 100},
    { text: `${ANSI.grey}[ ${ANSI.yellow}WARN ${ANSI.grey}] ${ANSI.reset}Squasing bugs and removing viruses ... ILOVEYOU `, delay: 200},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}Terminal loading`, delay: 100},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}Welcome to NOS: Web Edition.`, delay: 100},
    { text: `${ANSI.grey}[  ${ANSI.green}OK  ${ANSI.grey}] ${ANSI.reset}Type 'help' for a list of commands.`, delay: 100},
];

async function printLines(lines) {
    for (const line of lines) {
        term.writeln(line.text);
        await new Promise(r => setTimeout(r, line.delay));
    }
};

let cwd = [...HOME];
let inputBuffer = "";

function promptPath() {
    const homePath = "/" + HOME.join("/");
    const cwdPath = "/" + cwd.join("/");
    if (cwdPath === homePath) return "~";
    if (cwdPath.startsWith(homePath + "/")) return "~" + cwdPath.slice(homePath.length);
    return cwdPath;
}

function prompt() {
    term.write(
        `${ANSI.green}${USER}@${HOST}` +
        `${ANSI.white}:` +
        `${ANSI.blue}${promptPath()}` +
        `${ANSI.reset}$ `
    );
}

function tokenize(line) {
    const tokens = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
            continue;
        }
        if (!inQuotes && ch === " ") {
            if (current) tokens.push(current);
            current = "";
            continue;
        }
        current += ch;
    }

    if (current) tokens.push(current);
    return tokens;
}

function resolvePath(input) {
    if (!input || input === "~") return [...HOME];

    let raw = input;
    let base = raw.startsWith("/") ? [] : [...cwd];

    if (raw.startsWith("~")) {
        base = [...HOME];
        raw = raw.slice(1);
        if (raw.startsWith("/")) raw = raw.slice(1);
    }

    const parts = raw.split("/").filter(Boolean);
    for (const part of parts) {
        if (part === ".") continue;
        if (part === "..") {
            if (base.length > 0) base.pop();
            continue;
        }
        base.push(part);
    }

    return base;
}

function getNode(pathParts) {
    let node = FS;
    for (const part of pathParts) {
        if (!node || node.type !== "dir") return null;
        node = node.children[part];
        if (!node) return null;
    }
    return node;
}

function listDir(node) {
    if (node.type !== "dir") return [];
    return Object.keys(node.children)
        .sort()
        .map((name) => node.children[name].type === "dir" ? `${name}/` : name);
}

function writeLines(text) {
    const lines = String(text).split("\n");
    for (const line of lines) term.writeln(line);
}

const doomState = {
    running: false,
    resolve: null,
    animationId: null,
    exports: null,
    memory: null,
    cleanup: null
};

function rgbToXterm256(r, g, b) {
    if (r === g && g === b) {
        if (r < 8) return 16;
        if (r > 248) return 231;
        return 232 + Math.round((r - 8) / 10);
    }

    const rIdx = Math.round((r / 255) * 5);
    const gIdx = Math.round((g / 255) * 5);
    const bIdx = Math.round((b / 255) * 5);
    return 16 + (36 * rIdx) + (6 * gIdx) + bIdx;
}

function doomKeyCode(keyCode) {
    switch (keyCode) {
        case 8:
            return 127; // KEY_BACKSPACE
        case 17:
            return (0x80 + 0x1d); // KEY_RCTRL
        case 18:
            return (0x80 + 0x38); // KEY_RALT
        case 37:
            return 0xac; // KEY_LEFTARROW
        case 38:
            return 0xad; // KEY_UPARROW
        case 39:
            return 0xae; // KEY_RIGHTARROW
        case 40:
            return 0xaf; // KEY_DOWNARROW
        default:
            if (keyCode >= 65 && keyCode <= 90) {
                return keyCode + 32; // ASCII to lower case
            }
            if (keyCode >= 112 && keyCode <= 123) {
                return keyCode + 75; // KEY_F1
            }
            return keyCode;
    }
}

function renderDoomFrame(ptr) {
    if (!doomState.running || !doomState.memory) return;

    const cols = Math.max(1, term.cols - DOOM_PAD_COLS * 2);
    const rows = Math.max(1, term.rows - DOOM_PAD_ROWS * 2);
    const src = new Uint8ClampedArray(
        doomState.memory.buffer,
        ptr,
        DOOM_SCREEN_WIDTH * DOOM_SCREEN_HEIGHT * 4
    );

    const xScale = DOOM_SCREEN_WIDTH / cols;
    const yScale = DOOM_SCREEN_HEIGHT / (rows * 2);
    const rowStride = DOOM_SCREEN_WIDTH * 4;

    const fullLine = " ".repeat(Math.max(1, term.cols));
    let output = "\x1b[H\x1b[0m";
    let lastFg = -1;
    let lastBg = -1;

    for (let pad = 0; pad < DOOM_PAD_ROWS; pad += 1) {
        output += fullLine + "\r\n";
    }

    for (let y = 0; y < rows; y += 1) {
        output += "\x1b[0m" + " ".repeat(DOOM_PAD_COLS);
        lastFg = -1;
        lastBg = -1;

        const topY = Math.floor((y * 2) * yScale);
        const bottomY = Math.floor((y * 2 + 1) * yScale);
        const topRow = topY * rowStride;
        const bottomRow = bottomY * rowStride;

        for (let x = 0; x < cols; x += 1) {
            const srcX = Math.floor(x * xScale);
            const topIdx = topRow + srcX * 4;
            const bottomIdx = bottomRow + srcX * 4;
            const fg = rgbToXterm256(src[topIdx], src[topIdx + 1], src[topIdx + 2]);
            const bg = rgbToXterm256(src[bottomIdx], src[bottomIdx + 1], src[bottomIdx + 2]);

            if (fg !== lastFg) {
                output += `\x1b[38;5;${fg}m`;
                lastFg = fg;
            }
            if (bg !== lastBg) {
                output += `\x1b[48;5;${bg}m`;
                lastBg = bg;
            }

            output += DOOM_BLOCK;
        }

        output += "\x1b[0m" + " ".repeat(DOOM_PAD_COLS);
        if (y < rows - 1) output += "\r\n";
    }

    for (let pad = 0; pad < DOOM_PAD_ROWS; pad += 1) {
        output += "\r\n" + fullLine;
    }

    term.write(output);
}

function stopDoom() {
    if (!doomState.running) return;

    doomState.running = false;
    if (doomState.animationId) cancelAnimationFrame(doomState.animationId);
    if (doomState.cleanup) doomState.cleanup();

    doomState.animationId = null;
    doomState.exports = null;
    doomState.memory = null;

    term.write("\x1b[0m\x1b[?25h\x1b[2J\x1b[H");

    if (doomState.resolve) {
        const resolve = doomState.resolve;
        doomState.resolve = null;
        resolve();
    }
}

function startDoom() {
    if (doomState.running) return Promise.resolve();

    doomState.running = true;
    term.write("\x1b[2J\x1b[H\x1b[?25l");
    term.focus();

    const promise = new Promise((resolve) => {
        doomState.resolve = resolve;
    });

    const onKeyDown = (event) => {
        if (!doomState.running) return;
        if (event.ctrlKey && (event.key === "c" || event.key === "C")) {
            event.preventDefault();
            stopDoom();
            return;
        }
        if (!doomState.exports) return;
        doomState.exports.add_browser_event(0 /*KeyDown*/, doomKeyCode(event.keyCode));
        event.preventDefault();
    };

    const onKeyUp = (event) => {
        if (!doomState.running || !doomState.exports) return;
        doomState.exports.add_browser_event(1 /*KeyUp*/, doomKeyCode(event.keyCode));
        event.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    doomState.cleanup = () => {
        document.removeEventListener("keydown", onKeyDown, true);
        document.removeEventListener("keyup", onKeyUp, true);
    };

    doomState.memory = new WebAssembly.Memory({ initial: 108 });

    const importObject = {
        js: {
            js_console_log() {},
            js_stdout() {},
            js_stderr() {},
            js_milliseconds_since_start: () => performance.now(),
            js_draw_screen: renderDoomFrame
        },
        env: {
            memory: doomState.memory
        }
    };

    WebAssembly.instantiateStreaming(fetch("/doom/doom.wasm"), importObject)
        .then((obj) => {
            if (!doomState.running) return;
            doomState.exports = obj.instance.exports;
            doomState.exports.main();

            const step = () => {
                if (!doomState.running || !doomState.exports) return;
                doomState.exports.doom_loop_step();
                doomState.animationId = window.requestAnimationFrame(step);
            };

            doomState.animationId = window.requestAnimationFrame(step);
        })
        .catch((err) => {
            term.writeln(`doom: ${err.message}`);
            stopDoom();
        });

    return promise;
}

const COMMANDS = {
    help() {
        writeLines(
            "Available commands:\n" +
            "  help, ls, cd, pwd, cat, neofetch, echo, whoami, date, clear\n" +
            "Try: ls, cd projects, cat about.txt"
        );
    },
    ls(args) {
        const target = args[0] ? resolvePath(args[0]) : cwd;
        const node = getNode(target);
        if (!node) {
            term.writeln(`ls: cannot access '${args[0]}': No such file or directory`);
            return;
        }
        if (node.type === "file") {
            term.writeln(args[0]);
            return;
        }
        const items = listDir(node);
        term.writeln(items.join("  "));
    },
    cd(args) {
        const target = args[0] ? resolvePath(args[0]) : HOME;
        const node = getNode(target);
        if (!node) {
            term.writeln(`cd: ${args[0]}: No such file or directory`);
            return;
        }
        if (node.type !== "dir") {
            term.writeln(`cd: ${args[0]}: Not a directory`);
            return;
        }
        cwd = target;
    },
    pwd() {
        term.writeln("/" + cwd.join("/"));
    },
    cat(args) {
        if (!args[0]) {
            term.writeln("cat: missing file operand");
            return;
        }
        const target = resolvePath(args[0]);
        const node = getNode(target);
        if (!node) {
            term.writeln(`cat: ${args[0]}: No such file or directory`);
            return;
        }
        if (node.type !== "file") {
            term.writeln(`cat: ${args[0]}: Is a directory`);
            return;
        }
        writeLines(node.content);
    },
    neofetch(args) {
        return printLines(neofetchLines);
    },
    echo(args) {
        term.writeln(args.join(" "));
    },
    whoami() {
        term.writeln(USER);
    },
    date() {
        term.writeln(new Date().toString());
    },
    clear() {
        term.clear();
    },
    doom() {
        return startDoom();
    }
};

function runCommand(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    const tokens = tokenize(trimmed);
    const cmd = tokens[0];
    const args = tokens.slice(1);

    const handler = COMMANDS[cmd];
    if (!handler) {
        term.writeln(`${cmd}: command not found`);
        return;
    }
    return handler(args);
}

term.onData((data) => {
    if (doomState.running) return;
    for (const ch of data) {
        if (ch === "\r") {
            term.write("\r\n");
            const result = runCommand(inputBuffer);
            inputBuffer = "";
            if (result && typeof result.then === "function") {
                result.then(() => prompt());
            } else {
                prompt();
            }
        } else if (ch === "\u0003") {
            term.write("^C\r\n");
            inputBuffer = "";
            prompt();
        } else if (ch === "\u000c") {
            term.clear();
            inputBuffer = "";
            prompt();
        } else if (ch === "\u007F") {
            if (inputBuffer.length > 0) {
                term.write("\b \b");
                inputBuffer = inputBuffer.slice(0, -1);
            }
        } else if (ch >= " ") {
            inputBuffer += ch;
            term.write(ch);
        }
    }
});

printLines(bootLines).then(() => {
    prompt();
});

const overlay = document.getElementById("window-overlay");
const frame = document.getElementById("window-frame");
const titleEl = document.getElementById("window-title");
const closeBtn = document.getElementById("window-close");

function openWindow(url, title) {
    frame.src = url;
    titleEl.textContent = title || url;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
}

function closeWindow() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    frame.src = "about:blank";
}

if (overlay && frame && titleEl && closeBtn) {
    closeBtn.addEventListener("click", closeWindow);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeWindow();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeWindow();
    });
}