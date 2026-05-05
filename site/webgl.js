(function () {
    const state = {
        running: false,
        canvas: null,
        gl: null,
        program: null,
        positionBuffer: null,
        texCoordBuffer: null,
        texture: null,
        textWidth: 0,
        textHeight: 0,
        uResolution: null,
        uTexture: null,
        aPosition: null,
        aTexCoord: null,
        rafId: null,
        sprites: [],
        clickHandler: null
    };

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(info || "Shader compile failed");
        }
        return shader;
    }

    function createProgram(gl, vertexSource, fragmentSource) {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(info || "Program link failed");
        }
        return program;
    }

    function drawRoundedRect(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w * 0.5, h * 0.5);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    function buildTextTexture(gl, text) {
        const fontSize = 48;
        const padding = 12;
        const textCanvas = document.createElement("canvas");
        const ctx = textCanvas.getContext("2d");
        ctx.font = `${fontSize}px "Space Mono", monospace`;
        const metrics = ctx.measureText(text);
        const width = Math.ceil(metrics.width) + padding * 2;
        const height = Math.ceil(fontSize + padding * 1.5);
        textCanvas.width = width;
        textCanvas.height = height;

        ctx.font = `${fontSize}px "Space Mono", monospace`;
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, padding, padding * 0.6);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);

        return { texture, width, height };
    }

    function buildShapeTexture(gl, width, height, draw) {
        const shapeCanvas = document.createElement("canvas");
        shapeCanvas.width = width;
        shapeCanvas.height = height;
        const ctx = shapeCanvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        draw(ctx, width, height);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shapeCanvas);

        return { texture, width, height };
    }

    function updatePositionBuffer(x, y, w, h) {
        const gl = state.gl;
        if (!gl) return;

        const positions = new Float32Array([
            x, y,
            x + w, y,
            x, y + h,
            x, y + h,
            x + w, y,
            x + w, y + h
        ]);

        const texCoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, state.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    function updateLayout() {
        const margin = 40;
        const gap = 24;
        let y = margin;

        for (const sprite of state.sprites) {
            sprite.x = margin;
            sprite.y = y;
            y += sprite.height + gap;
        }
    }

    function ensureTexCoords() {
        const gl = state.gl;
        if (!gl || state.texCoordBuffer) return;
        const texCoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ]);
        state.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, state.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    }

    function resize() {
        const gl = state.gl;
        const canvas = state.canvas;
        if (!gl || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(window.innerWidth * dpr));
        const height = Math.max(1, Math.floor(window.innerHeight * dpr));
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.useProgram(state.program);
        gl.uniform2f(state.uResolution, width, height);
        updateLayout();
    }

    function render() {
        const gl = state.gl;
        if (!gl || !state.running) return;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(state.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(state.uTexture, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, state.texCoordBuffer);
        gl.enableVertexAttribArray(state.aTexCoord);
        gl.vertexAttribPointer(state.aTexCoord, 2, gl.FLOAT, false, 0, 0);

        for (const sprite of state.sprites) {
            gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
            updatePositionBuffer(sprite.x, sprite.y, sprite.width, sprite.height);
            gl.bindBuffer(gl.ARRAY_BUFFER, state.positionBuffer);
            gl.enableVertexAttribArray(state.aPosition);
            gl.vertexAttribPointer(state.aPosition, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        state.rafId = requestAnimationFrame(render);
    }

    function start() {
        if (state.running) return;

        const canvas = document.getElementById("gl-canvas") || document.createElement("canvas");
        canvas.id = "gl-canvas";
        canvas.style.display = "block";
        canvas.style.position = "fixed";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        if (!canvas.parentElement) {
            document.body.prepend(canvas);
        }

        const gl = canvas.getContext("webgl", { antialias: true, depth: true });
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        document.body.classList.add("webgl-active");
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";

        const vertexSource = [
            "attribute vec2 a_position;",
            "attribute vec2 a_texCoord;",
            "uniform vec2 u_resolution;",
            "varying vec2 v_texCoord;",
            "void main() {",
            "  vec2 zeroToOne = a_position / u_resolution;",
            "  vec2 zeroToTwo = zeroToOne * 2.0;",
            "  vec2 clipSpace = zeroToTwo - 1.0;",
            "  gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);",
            "  v_texCoord = a_texCoord;",
            "}"
        ].join("\n");

        const fragmentSource = [
            "precision mediump float;",
            "varying vec2 v_texCoord;",
            "uniform sampler2D u_texture;",
            "void main() {",
            "  gl_FragColor = texture2D(u_texture, v_texCoord);",
            "}"
        ].join("\n");

        let program;
        try {
            program = createProgram(gl, vertexSource, fragmentSource);
        } catch (error) {
            console.error(error);
            return;
        }

        const textSprite = buildTextTexture(gl, "Hello World");
        const rectSprite = buildShapeTexture(gl, 220, 90, (ctx) => {
            ctx.fillStyle = "#4aa3ff";
            ctx.fillRect(0, 0, 220, 90);
        });
        const roundedSprite = buildShapeTexture(gl, 220, 90, (ctx) => {
            ctx.fillStyle = "#5ad178";
            drawRoundedRect(ctx, 0, 0, 220, 90, 18);
        });
        const circleSprite = buildShapeTexture(gl, 96, 96, (ctx, width, height) => {
            ctx.fillStyle = "#f0c34f";
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, width * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });

        state.running = true;
        state.canvas = canvas;
        state.gl = gl;
        state.program = program;
        state.positionBuffer = gl.createBuffer();
        state.texture = textSprite.texture;
        state.textWidth = textSprite.width;
        state.textHeight = textSprite.height;
        state.aPosition = gl.getAttribLocation(program, "a_position");
        state.aTexCoord = gl.getAttribLocation(program, "a_texCoord");
        state.uResolution = gl.getUniformLocation(program, "u_resolution");
        state.uTexture = gl.getUniformLocation(program, "u_texture");

        ensureTexCoords();
        state.sprites = [
            { id: "text", texture: textSprite.texture, width: textSprite.width, height: textSprite.height, x: 0, y: 0 },
            { id: "rect", texture: rectSprite.texture, width: rectSprite.width, height: rectSprite.height, x: 0, y: 0 },
            { id: "rounded", texture: roundedSprite.texture, width: roundedSprite.width, height: roundedSprite.height, x: 0, y: 0 },
            { id: "circle", texture: circleSprite.texture, width: circleSprite.width, height: circleSprite.height, x: 0, y: 0 }
        ];

        gl.useProgram(program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.06, 0.08, 0.12, 1.0);

        resize();
        window.addEventListener("resize", resize);

        state.clickHandler = (event) => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const x = (event.clientX - rect.left) * dpr;
            const y = (event.clientY - rect.top) * dpr;
            const hit = state.sprites.find((sprite) => (
                x >= sprite.x &&
                x <= sprite.x + sprite.width &&
                y >= sprite.y &&
                y <= sprite.y + sprite.height
            ));
            console.log("click pixel", Math.round(x), Math.round(y), hit ? `hit:${hit.id}` : "");
        };
        canvas.addEventListener("click", state.clickHandler);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                if (!state.running) return;
                const refreshed = buildTextTexture(gl, "Hello World");
                state.textWidth = refreshed.width;
                state.textHeight = refreshed.height;
                const textSpriteEntry = state.sprites.find((sprite) => sprite.id === "text");
                if (textSpriteEntry) {
                    textSpriteEntry.texture = refreshed.texture;
                    textSpriteEntry.width = refreshed.width;
                    textSpriteEntry.height = refreshed.height;
                }
                updateLayout();
            });
        }

        /*
        // Example: render an image (commented out).
        // const imageTexture = gl.createTexture();
        // const image = new Image();
        // image.src = "/media/your-image.png";
        // image.onload = () => {
        //     gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        //     gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        //     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        //     state.sprites.push({
        //         id: "image",
        //         texture: imageTexture,
        //         width: image.width,
        //         height: image.height,
        //         x: 0,
        //         y: 0
        //     });
        //     updateLayout();
        // };
        */

        state.rafId = requestAnimationFrame(render);
    }

    function stop() {
        if (!state.running) return;
        state.running = false;
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = null;
        document.body.classList.remove("webgl-active");
        if (state.canvas && state.clickHandler) {
            state.canvas.removeEventListener("click", state.clickHandler);
            state.clickHandler = null;
        }
        if (state.canvas) state.canvas.style.display = "none";
    }

    window.WebglApp = {
        start,
        stop,
        isRunning: () => state.running
    };
})();
