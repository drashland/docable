import { Docable } from "./mod.ts";

const d = new Docable([
  "./tests/data/file.ts",
]);

const json = d.run();

console.log(JSON.parse(Deno.args))
