export default {
    name: "help",
    help: "List available commands.",
    run(args, ctx) {
        const names = ctx.getCommandNames ? ctx.getCommandNames() : [];
        if (!names.length) {
            ctx.term.writeln("No commands available");
            return;
        }
        ctx.writeLines(`Available commands:\n  ${names.join(", ")}`);
    }
};
