import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";

const meta: MetaFunction = () => ({
  title: "React Router | Resources",
});

const ResourcesPage: RouteComponent = () => {
  return (
    <div className="container py-8">
      <div className="text-center max-w-[600px] mx-auto">
        <h1 className="font-display text-[40px] leading-[1.2] font-bold text-white md:text-7xl md:leading-[0.89]">
          Resources for
          <br /> Developers
        </h1>
        <p className="mt-4 text-lg leading-8 md:mt-2 md:text-xl">
          React Router is built and maintained by our community of like-minded
          developers. We have over 2.4 million contributors and active
          moderators to help you implement your code.
        </p>
      </div>
    </div>
  );
};

export default ResourcesPage;
export { meta };
