export default {
    name: "desktop",
    help: "Launch the WebGL desktop mode.",
    run(args, ctx) {
        if (!ctx || typeof ctx.startDesktop !== "function") {
            if (ctx && ctx.term) ctx.term.writeln("desktop: not available");
            return;
        }
        ctx.startDesktop();
    }
};
