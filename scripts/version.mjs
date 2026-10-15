import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = path => readFileSync(resolve(root, path), "utf8");
const pkg = JSON.parse(read("package.json"));
const version = pkg.version;
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:[0-9A-Za-z-]+\.)*[0-9A-Za-z-]+)?$/.test(version)) {
  throw new Error(`Versão inválida: ${version}`);
}

const updates = new Map();
for (const path of ["src-tauri/tauri.conf.json", "package-lock.json"]) {
  const current = read(path);
  const data = JSON.parse(current);
  data.version = version;
  if (path === "package-lock.json") data.packages[""].version = version;
  updates.set(path, JSON.stringify(data, null, 2) + "\n");
}
for (const [path, pattern] of [
  ["src-tauri/Cargo.toml", /(\[package\][\s\S]*?\nversion = ")[^"]+("\r?\n)/],
  ["src-tauri/Cargo.lock", /(\[\[package\]\]\r?\nname = "revisum"\r?\nversion = ")[^"]+("\r?\n)/],
]) {
  const current = read(path);
  if (!pattern.test(current)) throw new Error(`Não foi possível localizar a versão em ${path}`);
  updates.set(path, current.replace(pattern, (_, before, after) => before + version + after));
}

// Compare normalized line endings only for manifests; migrations are never read
// or rewritten by this tool.
const normalize = value => value.replaceAll("\r\n", "\n");
const pending = [...updates].filter(([path, next]) => normalize(read(path)) !== normalize(next));
if (process.argv.includes("--check")) {
  if (pending.length) throw new Error(`Versões ou manifests divergentes: ${pending.map(([path]) => path).join(", ")}. Execute npm run version:sync.`);
} else {
  for (const [path, next] of pending) writeFileSync(resolve(root, path), next);
}
const tag = process.env.GITHUB_REF?.startsWith("refs/tags/") ? process.env.GITHUB_REF.slice(10) : null;
if (tag && tag !== `v${version}`) throw new Error(`Tag ${tag} difere da versão v${version}.`);
if (process.argv.includes("--github-output") && process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\nprerelease=${version.includes("-")}\n`);
}
console.log(`Revisum ${version}: manifests sincronizados${process.argv.includes("--check") ? " e verificados" : ""}.`);
