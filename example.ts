import { Docable } from "./mod.ts";

const d = new Docable(
  [
    "./tests/data/class.ts",
  ]
);

const json = d.run();

console.log(Deno.args)
