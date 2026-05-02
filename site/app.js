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

let fsRoot = null;
let manifestPromise = null;

function isDirNode(node) {
    return Boolean(node && (node.type === "dir" || node.type === "folder" || node.type === "rootfs"));
}

function toFsUrl(pathParts) {
    const parts = Array.isArray(pathParts) ? pathParts : [];
    const encoded = parts.map((part) => encodeURIComponent(String(part)));
    return "/fs/" + encoded.join("/");
}

function loadManifest() {
    if (manifestPromise) return manifestPromise;

    manifestPromise = fetch("/fs/manifest.json")
        .then((response) => response.json())
        .then((root) => {
            if (!root) {
                term.writeln("manifest: empty");
                return null;
            }
            fsRoot = root;
            return root;
        })
        .catch((error) => {
            console.error("Error: ", error);
            term.writeln("manifest: failed to load");
            return null;
        });

    return manifestPromise;
}

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
let inputLocked = false;

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

function getCwd() {
    return cwd;
}

function setCwd(next) {
    cwd = next;
}

function setInputLock(locked) {
    inputLocked = Boolean(locked);
}

function isInputLocked() {
    return inputLocked;
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
    if (!fsRoot) return null;
    let node = fsRoot;
    for (const part of pathParts) {
        if (!node || !Array.isArray(node.children)) return null;
        node = node.children.find((child) => child.name === part);
        if (!node) return null;
    }
    return node;
}

const commands = new Map();

async function loadCommands() {
    const importPromises = [];

    const renderTree = (node) => {
        if (!node || typeof node !== "object") return;

        if (node.type === "binary") {
            const name = node.name ? String(node.name) : "(unnamed)";
            if (node.path) {
                const importPromise = import(node.path)
                    .then((mod) => {
                        const command = mod && mod.default ? mod.default : mod;
                        if (command && typeof command.run === "function") {
                            commands.set(name, command);
                            return;
                        }
                        term.writeln(`load: invalid command ${name}`);
                    })
                    .catch((error) => {
                        console.error("Error: ", error);
                        term.writeln(`load: failed to import ${name}`);
                    });

                importPromises.push(importPromise);
            }
        }

        const children = Array.isArray(node.children) ? node.children : [];
        for (const child of children) {
            renderTree(child);
        }
    };

    const root = await loadManifest();
    if (!root) return;
    renderTree(root);
    await Promise.all(importPromises);
}

function listDir(node) {
    if (!isDirNode(node)) return [];
    const children = Array.isArray(node.children) ? node.children : [];
    return children
        .slice()
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        .map((child) => isDirNode(child) ? `${child.name}/` : child.name);
}

function writeLines(text) {
    const lines = String(text).split("\n");
    for (const line of lines) term.writeln(line);
}

const commandContext = {
    term,
    writeLines,
    resolvePath,
    getNode,
    listDir,
    printLines,
    ANSI,
    HOME,
    USER,
    HOST,
    getCwd,
    setCwd,
    setInputLock,
    isInputLocked,
    getCommandNames: () => Array.from(commands.keys()).sort(),
    isDirNode,
    toFsUrl
};

function runCommandLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    const tokens = tokenize(trimmed);
    const cmd = tokens[0];
    const args = tokens.slice(1);

    return runCommandByName(cmd, args);
}

function runCommandByName(name, args) {
    const cmd = commands.get(name);
    if (!cmd) {
        term.writeln(`${name}: command not found`);
        return;
    }
    return cmd.run(args, commandContext);
}

term.onData((data) => {
    if (inputLocked) return;
    for (const ch of data) {
        if (ch === "\r") {
            term.write("\r\n");
            const result = runCommandLine(inputBuffer);
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

async function init() {
    await loadCommands();
    printLines(bootLines).then(() => prompt());
}
init();