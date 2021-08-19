import * as React from "react";
import { Outlet } from "react-router-dom";
import { RouteComponent } from "remix";

const VersionPage: RouteComponent = () => {
  return <Outlet />;
};

export default VersionPage;
