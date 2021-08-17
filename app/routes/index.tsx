import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";

const meta: MetaFunction = () => ({
  title: "Hello World!",
});

const Page: RouteComponent = () => {
  return <p>👋</p>;
};

export default Page;
export { meta };
