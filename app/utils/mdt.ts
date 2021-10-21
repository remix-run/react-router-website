import fs from "fs/promises";
import path from "path";
import { process } from "@ryanflorence/mdtut";
import { remarkCodeBlocksShiki } from "./process-markdown";
import remark from "remark";
import html from "remark-html";

// This is relative to where this code ends up in the build, not the source
let contentPath = path.join(__dirname, "..", "..", "md");

export async function processMdt(filename: string) {
  let filePath = path.join(contentPath, filename);
  let mdt = await fs.readFile(filePath);
  let processor = remark().use(remarkCodeBlocksShiki).use(html);
  let result = await process(processor, mdt);
  return result;
}
