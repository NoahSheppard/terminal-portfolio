export default {
    name: "clear",
    help: "Clear the terminal.",
    run(args, ctx) {
        ctx.term.clear();
    }
};
