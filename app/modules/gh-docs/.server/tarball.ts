import { Readable } from "node:stream";
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
  // Stream the decompression rather than inflating the entire archive into a
  // single buffer. The archive includes the whole repo (source, tests, etc.)
  // but we only care about a handful of markdown files, and buffering it all
  // made concurrent menu builds use a lot of memory.
  let data: AsyncIterable<Uint8Array> = Readable.from([compressedData]).pipe(
    zlib.createGunzip(),
  );

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

function removeRepoRefName(headerName: string): string {
  return headerName.replace(/^.+?[/]/, "");
}
