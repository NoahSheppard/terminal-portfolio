export default {
    name: "ls",
    help: "List directory contents.",
    run(args, ctx) {
        const target = args[0] ? ctx.resolvePath(args[0]) : ctx.getCwd();
        const node = ctx.getNode(target);
        if (!node) {
            ctx.term.writeln(`ls: cannot access '${args[0]}': No such file or directory`);
            return;
        }
        if (!ctx.isDirNode(node)) {
            ctx.term.writeln(args[0] || node.name || "");
            return;
        }
        const items = ctx.listDir(node);
        ctx.term.writeln(items.join("  "));
    }
};
