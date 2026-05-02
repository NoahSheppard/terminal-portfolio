export default {
    name: "echo",
    help: "Print text.",
    run(args, ctx) {
        ctx.term.writeln(args.join(" "));
    }
};
