export default {
    name: "whoami",
    help: "Print current user.",
    run(args, ctx) {
        ctx.term.writeln(ctx.USER);
    }
};
