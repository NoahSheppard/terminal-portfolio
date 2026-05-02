export default {
    name: "cat",
    help: "Print a file.",
    run(args, ctx) {
        if (!args[0]) {
            ctx.term.writeln("cat: missing file operand");
            return;
        }
        const target = ctx.resolvePath(args[0]);
        const node = ctx.getNode(target);
        if (!node) {
            ctx.term.writeln(`cat: ${args[0]}: No such file or directory`);
            return;
        }
        if (node.type !== "file") {
            ctx.term.writeln(`cat: ${args[0]}: Is not a file`);
            return;
        }
        const url = ctx.toFsUrl(target);
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("read failed");
                }
                return response.text();
            })
            .then((text) => ctx.writeLines(text))
            .catch(() => {
                ctx.term.writeln(`cat: ${args[0]}: Unable to read file`);
            });
    }
};