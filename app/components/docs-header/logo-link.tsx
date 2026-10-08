"use client";

import { Link, useNavigate } from "react-router";
import iconsHref from "~/icons.svg";

export function LogoLink() {
  let navigate = useNavigate();
  return (
    <Link
      to="/home"
      className="hidden items-center gap-1 text-gray-900 dark:text-white md:flex"
      onContextMenu={(event) => {
        event.preventDefault();
        navigate("/brand");
      }}
    >
      <svg
        aria-label="React Router logo, six dots in an upward triangle (one on top, two in the middle, three on the bottom) with a path of three highlighted and connected from top to bottom, next to the text React Router"
        className="h-14 w-40"
      >
        <use href={`${iconsHref}#logo`} />
      </svg>
    </Link>
  );
}
