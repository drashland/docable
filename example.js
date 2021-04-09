const mod = require("./mod.ts");
console.log(mod);
const d = new mod.Docable([
    "./tests/data/file.ts",
]);

const json = d.run();
