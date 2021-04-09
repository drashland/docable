import { Rhum } from "../../deps.ts";

import { Docable } from "../../mod.ts";

const d = new Docable(
  [
    "./tests/data/class.ts",
  ]
);

const json = d.run();

console.log(json);
