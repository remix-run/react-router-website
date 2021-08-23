import * as React from "react";
import { Outlet } from "react-router-dom";
import { json, LoaderFunction, RouteComponent } from "remix";
import { addTrailingSlash } from "../../utils.server";

let loader: LoaderFunction = ({ request }) => {
  return addTrailingSlash(request, () => json({}));
};

let VersionPage: RouteComponent = () => {
  return <Outlet />;
};

export default VersionPage;
export { loader };
