import { Resolver } from "dns/promises";

async function getInstanceURLs(): Promise<string[]> {
  let resolver = new Resolver();
  let address = `global.${process.env.FLY_APP_NAME}.internal`;
  let ipv6s = await resolver.resolve6(address);
  return ipv6s.map((ip) => `http://${ip}`);
  return [];
}

export { getInstanceURLs };
