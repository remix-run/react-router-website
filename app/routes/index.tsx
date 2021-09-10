import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";
import { Field, Radio, Checkbox, Select } from "../components/form";
import { Button } from "../components/button";

const meta: MetaFunction = () => ({
  title: "React Router",
});

const IndexPage: RouteComponent = () => {
  return (
    <div className="container py-8">
      <div className="text-center mx-auto">
        <h1
          className={`
          font-display leading-[1.2] font-bold text-white
          text-4xl
          md:text-7xl md:leading-3
          lg:text-4xl
        `}
        >
          Learn Once
          <br /> Route Anywhere
        </h1>
        <p className="mt-4 text-lg leading-8 md:mt-2 md:text-xl">
          Components are the heart of React's powerful programming model. React
          Router is a collection of navigational components that compose
          declaratively with your application.
        </p>
      </div>
      <div className="h-">
        <Select>
          <option>One</option>
          <option>Two</option>
          <option>Three</option>
        </Select>
        <Field />
        <label>
          <Checkbox /> Hello
        </label>
      </div>
    </div>
  );
};

export default IndexPage;
export { meta };
