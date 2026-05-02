export default {
    name: "pwd",
    help: "Print working directory.",
    run(args, ctx) {
        ctx.term.writeln("/" + ctx.getCwd().join("/"));
    }
};
