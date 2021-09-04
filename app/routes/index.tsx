import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";

const meta: MetaFunction = () => ({
  title: "React Router",
});

const IndexPage: RouteComponent = () => {
  return (
    <div className="container py-8">
      <div className="text-center lg:max-w-[600px] lg:mx-auto">
        <h1 className="text-[40px] leading-[1.2] font-bold text-white lg:text-7xl lg:leading-[0.89]">
          Learn Once Route Anywhere
        </h1>
        <p className="mt-2">
          Components are the heart of React's powerful programming model. React
          Router is a collection of navigational components that compose
          declaratively with your application.
        </p>
      </div>
    </div>
  );
};

export default IndexPage;
export { meta };
