import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";
import cx from "clsx";
import { Section, Heading } from "~/components/section-heading";
import { ButtonLink, ButtonDiv } from "~/components/button";
import { Link, ArrowLink } from "~/components/link";
import {
  IconLayers,
  IconNavigation,
  IconPlay,
  IconProtection,
  IconZoom,
} from "~/components/icons";

const meta: MetaFunction = () => ({
  title: "React Router",
});

const IndexPage: RouteComponent = () => {
  return (
    <div className="py-8">
      <div className="index__hero">
        <div className="container">
          <div className="text-center mx-auto my-24 md:my-32 lg:mt-36 max-w-xl">
            <h1 className="title mb-7">
              Learn Once.
              <br />
              Route Anywhere.
            </h1>
            <p className="opacity-80 text-lg leading-8 md:text-xl">
              Components are the heart of React's powerful programming model.
              React Router is a collection of navigational components that
              compose declaratively with your application.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center flex-shrink-0 flex-wrap mt-7">
              <ButtonLink size="large" to="/" className="mb-4 md:mb-0 md:mr-6">
                React Router for Web
              </ButtonLink>
              <ButtonLink size="large" to="/">
                React Router for Native
              </ButtonLink>
            </div>
          </div>
          <div className="max-w-[1084px] m-auto">
            <div className="relative group">
              <Link
                to="/"
                className="block outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-60"
              >
                <img src="/hero.png" alt="TODO" />
                <ButtonDiv
                  variant="transparent"
                  rounded
                  className={`
                    inline-flex items-center
                    bg-black/70 group-hover:bg-black
                    text-white group-hover:text-white text-opacity-80 group-hover:text-opacity-100
                    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    whitespace-nowrap
                  `}
                >
                  <IconPlay color="var(--base0D)" className="mr-3" />
                  <span>See how React Router works</span>
                </ButtonDiv>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="index__sponsors">
        <div className="container">
          <div className="text-center my-20 md:my-32">
            <h2 className="eyebrow mb-6 md:mb-8">
              Used by dev teams at top companies
            </h2>
            <div className="flex-gap-wrapper">
              <ul
                className={`
                list-none
                flex flex-shrink-0 flex-grow-0 flex-wrap
                flex-gap flex-gap-6 md:flex-gap-8 lg:flex-gap-12
                items-center justify-center`}
              >
                {[
                  "shopify",
                  "zoom",
                  "microsoft",
                  "amazon",
                  "adobe",
                  "google",
                ].map((icon) => {
                  return (
                    <li
                      key={icon}
                      className="flex flex-shrink-0 flex-grow-0 items-center justify-center"
                    >
                      {/* TODO: Icons */}
                      <IconZoom />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="index__features">
        <div className="container">
          {[
            {
              heading: "Navigation Routes",
              content: `This is copy about Navigation Routes that will explain how
            React Router can help devs create one and why it’s better than
            building without it.`,
              link: "/",
              color: "blue",
              icon: <IconNavigation color="white" />,
            },
            {
              heading: "Protected Routes",
              content: `This is copy about Protected Routes that will explain how React Router can help devs create one and why it’s better than building without it.`,
              link: "/",
              color: "green",
              icon: <IconProtection color="white" />,
            },
            {
              heading: "Nested Routes",
              content: `This is copy about Nested Routes that will explain how React Router can help devs create one and why it’s better than building without it.`,
              link: "/",
              color: "red",
              icon: <IconLayers color="white" />,
            },
          ].map((section) => {
            return (
              <Section
                key={section.heading}
                wrap
                className="my-56 md:my-72 lg:my-80"
              >
                <div className="md:max-w-[494px]">
                  <div
                    className={cx(
                      "rounded-lg w-12 h-12 flex items-center justify-center flex-grow-0 flex-shrink-0 mb-6 md:mb-8",
                      {
                        "bg-blue-500": section.color === "blue",
                        "bg-green-500": section.color === "green",
                        "bg-red-500": section.color === "red",
                      }
                    )}
                  >
                    {section.icon}
                  </div>
                  <Heading className="mb-1">{section.heading}</Heading>
                  <p className="text-lg md:text-xl mb-6 opacity-80">
                    {section.content}
                  </p>
                  <ArrowLink
                    to={section.link}
                    className={cx(
                      "text-lg md:text-xl inline-flex items-center font-semibold outline-none focus:ring-2 focus:ring-opacity-60 focus:ring-offset-4 focus:ring-offset-black focus:ring-current",
                      {
                        "text-blue-500": section.color === "blue",
                        "hover:text-blue-400": section.color === "blue",
                        "text-green-500": section.color === "green",
                        "hover:text-green-400": section.color === "green",
                        "text-red-500": section.color === "red",
                        "hover:text-red-400": section.color === "red",
                      }
                    )}
                  >
                    Learn More
                  </ArrowLink>
                </div>
              </Section>
            );
          })}
        </div>
      </div>

      <div className="index__stats">
        <div className="container">
          <Section as="section" aria-label="Current user stats">
            <dl
              className={`
              grid grid-cols-2
              gap-6 sm:gap-0
              sm:flex sm:flex-wrap sm:flex-shrink-0 sm:flex-grow-0
              max-w-md sm:max-w-none
              m-auto
              items-center text-center justify-center
              `}
            >
              {[
                {
                  title: "GitHub Users",
                  desc: "2.4m",
                  tooltip: "2.4 million GitHub users",
                },
                {
                  title: "Contributors",
                  desc: "656",
                  tooltip: "656 contributors",
                },
                {
                  title: "Stable Release",
                  desc: "v6",
                  tooltip: "Stable Release: v6",
                },
                {
                  title: "npm Downloads",
                  desc: "3.6m",
                  tooltip: "3.6 million npm downloads",
                },
              ].map((stat, i, arr) => {
                return (
                  <div
                    className={cx(
                      "flex flex-col-reverse items-center uppercase",
                      {
                        ["sm:mr-6 md:mr-16 lg:mr-20"]: i !== arr.length - 1,
                      }
                    )}
                    key={stat.title}
                    title={stat.tooltip}
                  >
                    <dt className="font-normal leading-none text-sm lg:text-base uppercase">
                      {stat.title}
                    </dt>
                    <dd className="text-6xl md:text-8xl leading-none font-display font-bold">
                      {stat.desc}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Section>
        </div>
      </div>

      <div className="index__signup">
        <div className="container">
          <Section wrap className="my-56 md:my-72 lg:my-80">
            <div className="md:max-w-xl">
              <Heading className="mb-1">Join the Remix Community</Heading>
              <p className="text-lg md:text-xl mb-6 opacity-80">
                We’re introducing a new project—Remix—a React framework that can
                be used alongside React Router to build faster, more powerful
                applications. Join our newsletter to stay up to date.
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
export { meta };
