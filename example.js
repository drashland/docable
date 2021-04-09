const mod = require("./mod.ts");
console.log(mod);
const d = new mod.Docable([
    "./tests/data/class.ts",
]);

const json = d.run();
