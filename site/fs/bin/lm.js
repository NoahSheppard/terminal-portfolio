export default {
    name: "lm",
    help: "List manifest tree.",
    run(args, ctx) {
        const renderTree = (node, depth = 0) => {
            if (!node || typeof node !== "object") return;

            const indent = "  ".repeat(depth);
            const name = node.name ? String(node.name) : "(unnamed)";
            ctx.term.writeln(`${indent}${name}`);

            const children = Array.isArray(node.children) ? node.children : [];
            for (const child of children) {
                renderTree(child, depth + 1);
            }
        };

        return fetch("/fs/manifest.json")
            .then((response) => response.json())
            .then((root) => {
                if (!root) {
                    ctx.term.writeln("manifest: empty");
                    return;
                }
                renderTree(root);
            })
            .catch((error) => {
                console.error("Error: ", error);
                ctx.term.writeln("manifest: failed to load");
            });
    }
};
