import path from "path";
import fs from "fs";
import tar from "tar";
import { getMenuFromTarball } from "./docs";

describe("getMenuFromTarball", () => {
  it("sorts the menu with children and stuff", async () => {
    let tarball = await getFixtureTarball();
    let menu = await getMenuFromTarball(tarball);

    // removes `index.md` so only 2, not 3
    expect(menu.length).toBe(2);
    expect(menu[0].attrs.title).toBe("Components");
    expect(menu[0].children.length).toBe(2);

    expect(menu[1].attrs.title).toBe("Pages");
    expect(menu[1].children.length).toBe(2);

    expect(menu[1].children.length).toBe(2);
    expect(menu[1].slug).toBe("pages");
    expect(menu[1].children[0].attrs.title).toBe("Quickstart Tutorial");
    expect(menu[1].children[0].slug).toBe("pages/tutorial");
  });
});

async function getFixtureTarball(): Promise<Uint8Array> {
  let fixturePath = path.join(__dirname, "__fixture__");
  let writePath = path.join(fixturePath, "tar.tgz");
  await tar.c({ gzip: true, file: writePath }, [fixturePath]);
  return new Uint8Array(fs.readFileSync(writePath));
}
