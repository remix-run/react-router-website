import * as React from "react";
import { Link } from "~/components/link";
import logoCircleUrl from "~/icons/logo-circle.svg";
import githubLogoUrl from "~/icons/github.svg";
import twitterLogoUrl from "~/icons/twitter.svg";

const SiteFooter: React.VFC = () => {
  return (
    <footer
      className={`
      py-6 md:pt-10 md:pb-16
      border-t border-solid border-[color:var(--base02)]`}
    >
      <div className="container md:flex md:items-center md:justify-between">
        <div>
          <Link
            to="/"
            className="flex items-center space-x-4 text-[color:var(--base07)]"
          >
            <svg className="w-9 h-9">
              <use href={`${logoCircleUrl}#logo-circle`} />
            </svg>
            <span className="text-3xl font-bold font-display">
              React Router
            </span>
          </Link>
          <div className="mt-10 space-y-10 md:space-y-0 md:mt-6">
            <p>
              React Router is built and maintained by{" "}
              <Link className="font-semibold text-[color:var(--base07)]" to="https://remix.run">
                Remix
              </Link>{" "}
              and{" "}
              <Link
                className="font-semibold text-[color:var(--base07)]"
                to="https://github.com/ReactTraining/react-router/graphs/contributors"
              >
                hundreds of contributors
              </Link>
              .
            </p>

            <p>Code Examples and documentation CC 4.0</p>
          </div>

          <ul
            className={`
            my-12 text-xl leading-8 divide-y md:flex md:divide-none md:space-x-6 md:text-base md:tracking-wider md:font-medium divide-[#d7d7d7] text-[color:var(--base07)] md:text-[color:var(--base07)]/80 md:text-opacity-70"`}
          >
            <li>
              <Link
                to="/docs/"
                className="text-[color:var(--base07)] block py-4 md:py-0"
              >
                Documentation
              </Link>
            </li>
            <li>
              <Link
                to="/resources/"
                className="text-[color:var(--base07)] block py-4 md:py-0"
              >
                Resources
              </Link>
            </li>
            <li>
              <Link
                to="https://github.com/remix-run/react-router"
                className="text-[color:var(--base07)] block py-4 md:py-0"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link
                to="https://npm.im/react-router"
                className="text-[color:var(--base07)] block py-4 md:py-0"
              >
                NPM
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <ul className="flex items-center space-x-6">
            <li>
              <Link to="https://github.com/remix-run/react-router">
                <span className="sr-only">GitHub</span>
                <svg className="w-10 h-10">
                  <use href={`${githubLogoUrl}#github`} />
                </svg>
              </Link>
            </li>
            <li>
              <Link to="https://twitter.com/remix-run">
                <span className="sr-only">Twitter</span>
                <svg className="w-10 h-10">
                  <use href={`${twitterLogoUrl}#twitter`} />
                </svg>
              </Link>
            </li>
          </ul>
          <p className="mt-8">&copy; {new Date().getFullYear()} Remix</p>
        </div>
      </div>
    </footer>
  );
};

export { SiteFooter };
