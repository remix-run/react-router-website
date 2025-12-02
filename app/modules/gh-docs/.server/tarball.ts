import * as zlib from "node:zlib";
import { parseTar } from "@remix-run/tar-parser";

type ProcessFile = ({
  filename,
  content,
}: {
  filename: string;
  content: string;
}) => Promise<void>;

export function createTarFileProcessor(
  data: Uint8Array,
  pattern: RegExp = /docs\/(.+)\.md$/,
) {
  return (processFile: ProcessFile) =>
    processFilesFromRepoTarball(data, pattern, processFile);
}

async function processFilesFromRepoTarball(
  compressedData: Uint8Array,
  pattern: RegExp = /docs\/(.+)\.md$/,
  processFile: ProcessFile,
): Promise<void> {
  let data = await gunzip(compressedData);

  await parseTar(data, async (entry) => {
    // Make sure the file matches the ones we want to process
    // In tar format, "file" represents a regular file
    let isMatch = entry.header.type === "file" && pattern.test(entry.name);
    if (isMatch) {
      // remove "react-router-main" and "remix-v1.0.0" from the full name
      // that's something like "react-router-main/docs/index.md"
      let filename = removeRepoRefName(entry.name);
      // get the content as a string
      let content = await entry.text();
      await processFile({ filename, content });
    }
  });
}

/**
 * Decompress gzip data using node:zlib.
 */
function gunzip(data: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(data, (err, result) => {
      if (err) reject(err);
      else resolve(new Uint8Array(result));
    });
  });
}

function removeRepoRefName(headerName: string): string {
  return headerName.replace(/^.+?[/]/, "");
}
