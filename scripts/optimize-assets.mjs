import sharp from "sharp";
import { readdir } from "node:fs/promises";
const directory = new URL("../src/assets/illustrations/", import.meta.url);
for (const file of await readdir(directory)) {
  if (!file.endsWith(".png")) continue;
  const output = new URL(file.replace(".png", ".webp"), directory);
  await sharp(new URL(file, directory).pathname)
    .resize({
      width: 640,
      height: 640,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, alphaQuality: 95, effort: 6 })
    .toFile(output.pathname);
  console.log(output.pathname.split("/").pop());
}
