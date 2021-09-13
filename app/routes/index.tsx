import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";
import { Field, Radio, Checkbox, Select } from "../components/form";
import { ButtonLink } from "../components/button";

const meta: MetaFunction = () => ({
  title: "React Router",
});

const IndexPage: RouteComponent = () => {
  return (
    <div className="contain py-8">
      <div className="index__hero">
        <div className="text-center mx-auto mb-6 max-w-[566px]">
          <h1 className="title mb-7">
            Learn Once.
            <br />
            Route Anywhere.
          </h1>
          <p className="text-[color:var(--base05)] text-lg leading-8 md:text-xl">
            Components are the heart of React's powerful programming model.
            React Router is a collection of navigational components that compose
            declaratively with your application.
          </p>
          <div className="flex gap-4 items-center justify-center flex-shrink-0 flex-wrap mt-7">
            <ButtonLink size="large" to="/">
              React Router for Web
            </ButtonLink>
            <ButtonLink size="large" to="/">
              React Router for Native
            </ButtonLink>
          </div>
        </div>
        <div className="max-w-[1084px] m-auto">
          <img src="/hero.png" alt="TODO" />
        </div>
      </div>

      <div className="index__sponsors">
        <div className="text-center">
          <h2 className="eyebrow">Used by dev teams at top companies</h2>
          {/* TODO: Drop dem icons */}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
export { meta };
