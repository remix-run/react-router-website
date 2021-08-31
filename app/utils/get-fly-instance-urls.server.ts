import { resolve6 } from "dns/promises";

async function getInstanceURLs(): Promise<string[]> {
  let address = `global.${process.env.FLY_APP_NAME}.internal`;
  let ipv6s = await resolve6(address);
  // our internal port is 3000
  return ipv6s.map((ip) => `http://[${ip}]:3000`);
}

export { getInstanceURLs };
