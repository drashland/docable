import { Docable } from "./mod.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const d = new Docable([
  "./tests/data/file1.ts",
  "./tests/data/file2.ts",
]);

const json = d.run();

const file = Deno.args[0];

Deno.writeFileSync(file, encoder.encode(json as string));

let indexHtml = decoder.decode(Deno.readFileSync("index.template.html"));
indexHtml = indexHtml.replace("{{ json_replacement }}", json as string);

Deno.writeFileSync("index.html", encoder.encode(indexHtml));
