const DOOM_SCREEN_WIDTH = 320 * 2;
const DOOM_SCREEN_HEIGHT = 200 * 2;
const DOOM_BLOCK = "▀";
const DOOM_PAD_PX = 8;

const doomState = {
    running: false,
    resolve: null,
    animationId: null,
    exports: null,
    memory: null,
    cleanup: null,
    term: null,
    ctx: null
};

function getTerm() {
    return doomState.term;
}

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

function getDoomPadCells() {
    const term = getTerm();
    const dims = term && term._core && term._core._renderService
        ? term._core._renderService.dimensions
        : null;
    const cellWidth = dims && dims.actualCellWidth ? dims.actualCellWidth : null;
    const cellHeight = dims && dims.actualCellHeight ? dims.actualCellHeight : null;
    if (!cellWidth || !cellHeight) {
        return { cols: 1, rows: 1 };
    }

    return {
        cols: Math.max(1, Math.ceil(DOOM_PAD_PX / cellWidth)),
        rows: Math.max(1, Math.ceil(DOOM_PAD_PX / cellHeight))
    };
}

function renderDoomFrame(ptr) {
    const term = getTerm();
    if (!doomState.running || !doomState.memory || !term) return;

    const pad = getDoomPadCells();
    const cols = Math.max(1, term.cols - 6);
    const rows = Math.max(1, term.rows - 2);
    const src = new Uint8ClampedArray(
        doomState.memory.buffer,
        ptr,
        DOOM_SCREEN_WIDTH * DOOM_SCREEN_HEIGHT * 4
    );

    const xScale = DOOM_SCREEN_WIDTH / cols;
    const yScale = DOOM_SCREEN_HEIGHT / (rows * 2);
    const rowStride = DOOM_SCREEN_WIDTH * 4;

    let output = "\x1b[H\x1b[0m";
    let lastFg = -1;
    let lastBg = -1;

    for (let y = 0; y < rows; y += 1) {
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

        output += "\x1b[0m\x1b[K";
        if (y < rows - 1 || pad.rows > 0) output += "\r\n";
    }

    for (let padRow = 0; padRow < pad.rows; padRow += 1) {
        output += "\x1b[0m\x1b[K";
        if (padRow < pad.rows - 1) output += "\r\n";
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

    const term = getTerm();
    if (term) {
        term.write("\x1b[0m\x1b[?25h\x1b[2J\x1b[H");
    }

    if (doomState.ctx && typeof doomState.ctx.setInputLock === "function") {
        doomState.ctx.setInputLock(false);
    }

    if (doomState.resolve) {
        const resolve = doomState.resolve;
        doomState.resolve = null;
        resolve();
    }
}

function startDoom(ctx) {
    if (doomState.running) return Promise.resolve();
    if (!ctx || !ctx.term) return Promise.resolve();

    doomState.running = true;
    doomState.term = ctx.term;
    doomState.ctx = ctx;

    if (typeof ctx.setInputLock === "function") {
        ctx.setInputLock(true);
    }

    const term = getTerm();
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

export default {
    name: "doom",
    help: "Start Doom.",
    run(args, ctx) {
        return startDoom(ctx);
    }
};
