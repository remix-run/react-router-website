import * as React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

import logoCircleUrl from "~/icons/logo-circle.svg";
import githubLogoUrl from "~/icons/github.svg";
import twitterLogoUrl from "~/icons/twitter.svg";

const Footer: React.VFC<{ forceDarkMode: boolean }> = ({ forceDarkMode }) => {
  return (
    <footer className="py-6 border-t border-solid border-black/10 lg:pt-10 lg:pb-16">
      <div className="container lg:flex lg:items-center lg:justify-between">
        <div>
          <Link
            to="/"
            className={clsx(
              "flex items-center space-x-4",
              forceDarkMode ? "text-white" : "text-[#121212] dark:text-white"
            )}
          >
            <svg className="w-9 h-9">
              <use href={`${logoCircleUrl}#logo-circle`} />
            </svg>
            <span className="text-3xl font-bold font-display">
              React Router
            </span>
          </Link>
          <div className="mt-10 space-y-10 lg:space-y-0 lg:mt-6">
            <p>
              React Router is built and maintained by{" "}
              <a className="font-semibold" href="https://remix.run">
                Remix
              </a>{" "}
              and{" "}
              <a
                className="font-semibold"
                href="https://github.com/ReactTraining/react-router/graphs/contributors"
              >
                hundreds of contributors
              </a>
              .
            </p>

            <p>Code Examples and documentation CC 4.0</p>
          </div>

          <ul
            className={clsx(
              "my-12 text-xl leading-8 divide-y lg:flex lg:divide-none lg:space-x-6 lg:text-base lg:tracking-wider lg:font-medium divide-[#d7d7d7]",
              forceDarkMode
                ? "text-white lg:text-white/80 lg:text-opacity-70"
                : "text-[#121212] lg:text-[rgba(18, 18, 18, 0.8)]"
            )}
          >
            <li>
              <Link to="/docs" className="block py-4 lg:py-0">
                Documentation
              </Link>
            </li>
            <li>
              <Link to="/examples" className="block py-4 lg:py-0">
                Examples
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/remix-run/react-router"
                className="block py-4 lg:py-0"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://npm.im/react-router"
                className="block py-4 lg:py-0"
              >
                NPM
              </a>
            </li>
          </ul>
        </div>
        <div>
          <ul className="flex items-center space-x-6">
            <li>
              <a href="https://github.com/remix-run/react-router">
                <span className="sr-only">GitHub</span>
                <svg className="w-10 h-10">
                  <use href={`${githubLogoUrl}#github`} />
                </svg>
              </a>
            </li>
            <li>
              <a href="https://twitter.com/remix-run">
                <span className="sr-only">Twitter</span>
                <svg className="w-10 h-10">
                  <use href={`${twitterLogoUrl}#twitter`} />
                </svg>
              </a>
            </li>
          </ul>
          <p className="mt-8">&copy; {new Date().getFullYear()} Remix</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
