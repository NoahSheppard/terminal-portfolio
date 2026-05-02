export default {
    name: "date",
    help: "Print current date.",
    run(args, ctx) {
        ctx.term.writeln(new Date().toString());
    }
};
