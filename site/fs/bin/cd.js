export default {
    name: "cd",
    help: "Change directory.",
    run(args, ctx) {
        const target = args[0] ? ctx.resolvePath(args[0]) : ctx.HOME;
        const node = ctx.getNode(target);
        if (!node) {
            ctx.term.writeln(`cd: ${args[0]}: No such file or directory`);
            return;
        }
        if (!ctx.isDirNode(node)) {
            ctx.term.writeln(`cd: ${args[0]}: Not a directory`);
            return;
        }
        ctx.setCwd(target);
    }
};
