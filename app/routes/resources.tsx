import * as React from "react";
import cx from "clsx";
import { ButtonAnchor } from "../components/button";
import { Section, Heading } from "../components/section-heading";
import type {
  RouteComponent,
  MetaFunction,
  ActionFunction,
  LinksFunction,
} from "remix";
import { IconBox } from "~/components/icon-box";
import { Badge } from "~/components/badge";
import { Link, ArrowLink } from "~/components/link";
import {
  IconGithub,
  IconStackOverflow,
  IconTwitter,
  IconYoutube,
  // IconArrowRight,
} from "~/components/icons";
// import { Card, CardContent, CardImage } from "~/components/card";
import { SectionSignup, signupAction } from "~/components/section-signup";
import { seo } from "~/utils/seo";

let [seoMeta, seoLinks] = seo({
  title: "Resources",
  description:
    "React Router is built and maintained by the Remix team. Check out the various resources we offer to help you build better websites.",
});

export const meta: MetaFunction = () => ({
  ...seoMeta,
});

export const links: LinksFunction = () => [...seoLinks];

const ResourcesPage: RouteComponent = () => {
  return (
    <div className="py-8">
      <div className="resources__hero">
        <div className="container">
          <div
            className={`
              text-center md:text-left
              mx-auto md:mx-0
              my-24 md:my-32 lg:mt-36
              max-w-xl
            `}
          >
            <h1 className="title mb-7">Built by Remix</h1>
            <p className="opacity-80 text-lg leading-8 md:text-xl">
              React Router is built and maintained by the{" "}
              <a href="https://remix.run">Remix</a> team. You can follow React
              Router development by following our resources around the web.
            </p>
            <div
              className={`
                flex flex-col md:flex-row
                items-center justify-center md:justify-start
                flex-shrink-0 flex-wrap
                mt-7
              `}
            >
              <ButtonAnchor
                size="large"
                href="https://github.com/remix-run/react-router"
                className="mb-4 md:mb-0 md:mr-6"
              >
                Visit GitHub Repo
              </ButtonAnchor>
              <ButtonAnchor size="large" href="https://discord.gg/VBePs6d">
                Join Remix Discord
              </ButtonAnchor>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-20 sm:space-y-32 md:space-y-40 lg:space-y-44">
        <div className="resources__links">
          <div className="container">
            <Section as="section">
              {/* <SectionHeader
                heading="Built by Remix"
                content={
                  <div>
                    React Router is built by the{" "}
                    <a href="https://remix.run">Remix</a> team.
                  </div>
                }
                className="mb-10 md:mb-14"
              /> */}
              <dl className="grid grid-cols-1 grid-flow-row sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "GitHub",
                    desc: "Join the React Router GitHub repo to get news on the latest updates.",
                    icon: <IconGithub />,
                    linkTo: "https://github.com/remix-run/react-router",
                    linkLabel: "Visit GitHub",
                  },
                  {
                    title: "Twitter",
                    desc: "Follow the Remix Twitter account to get regular updates on React Router.",
                    icon: <IconTwitter />,
                    linkTo: "https://twitter.com/remix_run",
                    linkLabel: "Visit Twitter",
                  },
                  {
                    title: "YouTube",
                    desc: "Watch tutorials and screencasts from the Remix team.",
                    icon: <IconYoutube />,
                    linkTo: "https://www.youtube.com/remix_run",
                    linkLabel: "Visit YouTube",
                  },
                  {
                    title: "Stack Overflow",
                    desc: "Get help from the Remix team on using React Router in your application.",
                    icon: <IconStackOverflow />,
                    linkTo: "https://stackoverflow.com/questions/tagged/react-router",
                    linkLabel: "Visit Stack Overflow",
                  },
                ].map(({ icon, title, desc, linkLabel, linkTo }) => {
                  return (
                    <div key={title}>
                      <IconBox
                        icon={icon}
                        className="bg-[color:var(--hue-1000)] text-[color:var(--hue-0000)] mb-6"
                      />
                      <dt className="h3">{title}</dt>
                      <dd>
                        <div className="opacity-80">{desc}</div>
                        <div className="mt-3">
                          <ArrowLink
                            to={linkTo}
                            className="inline-flex items-center font-semibold"
                          >
                            {linkLabel}
                          </ArrowLink>
                        </div>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Section>
          </div>
        </div>

        {/* <div className="resources__projects">
          <div className="container">
            <Section as="section">
              <SectionHeader
                heading="Open Source Projects"
                content={`Apps and libraries from the Remix team to use alongside React
              Router`}
                className="mb-10"
              />
              <Section
                as="div"
                className="grid grid-cols-1 grid-flow-row sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
              >
                {[
                  {
                    imgSrc: "https://picsum.photos/500",
                    imgAlt: "TODO",
                    heading: "Remix",
                    content: `A new React framework that supports dynamic routing and more.`,
                    linkTo: "https://remix.run",
                    linkText: "Visit Remix",
                  },
                  {
                    imgSrc: "https://picsum.photos/502",
                    imgAlt: "TODO",
                    heading: "Reach UI",
                    content: `An accessible foundation for React applications and design systems.`,
                    linkTo: "https://reach.tech",
                    linkText: "Visit Reach UI",
                  },
                  {
                    imgSrc: "https://picsum.photos/504",
                    imgAlt: "TODO",
                    heading: "UNPKG",
                    content: `The CDN for everything on npm, currently serving more than 2 billion requests per day.`,
                    linkTo: "https://unpkg.com",
                    linkText: "Visit UNPKG",
                  },
                ].map((card) => {
                  return (
                    <Card key={card.heading}>
                      <CardImage>
                        <img src={card.imgSrc} alt={card.imgAlt} />
                      </CardImage>
                      <CardContent>
                        <Heading className="mb-2">{card.heading}</Heading>
                        <p className="opacity-80">{card.content}</p>
                        <ArrowLink to={card.linkTo} className="mt-4">
                          {card.linkText}
                        </ArrowLink>
                      </CardContent>
                    </Card>
                  );
                })}
              </Section>
            </Section>
          </div>
        </div> */}

        <div className="resources__versions">
          <div className="container">
            <Section as="section">
              <SectionHeader
                heading="Major Releases"
                content={`We maintain the following major releases of React Router`}
                className="mb-16 md:mb-28"
              />
              <Section as="div" className="flex flex-col max-w-xl mx-auto">
                {[
                  // TODO: Get versions from releases
                  {
                    heading: "React Router v6",
                    date: "September 2021",
                    docs: "/docs",
                    githubLink:
                      "https://github.com/remix-run/react-router/releases/tag/v6.0.0-beta.6",
                  },
                  {
                    heading: "React Router v5",
                    date: "September 2021",
                    docs: "https://v5.reactrouter.com",
                    githubLink:
                      "https://github.com/remix-run/react-router/releases/tag/v5.3.0",
                  },
                  {
                    heading: "React Router v3",
                    date: "February 2019",
                    docs: "https://github.com/remix-run/react-router/tree/v3.2.6/docs",
                    githubLink:
                      "https://github.com/remix-run/react-router/releases/tag/v3.2.6",
                  },
                ].map((release, i, arr) => {
                  return (
                    <div
                      key={release.heading}
                      className={cx({
                        "pb-8 md:pb-10 mb-8 md:mb-10 border-b border-[color:var(--hue-0200)]":
                          i !== arr.length - 1,
                      })}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <Heading>{release.heading}</Heading>
                        {i === 0 && (
                          <div>
                            <Badge color="green">Latest Release</Badge>
                          </div>
                        )}
                      </div>
                      <p className="opacity-80 text-lg leading-8 md:text-xl">
                        Last Release: {release.date}
                      </p>
                      <div className="mt-4">
                        <ul className="list-none flex items-center">
                          <li
                            className={`
                            after:content-["•"] after:inline-block after:mx-2 md:after:mx-4 md:after:content-["•"]
                            after:text-blue-500
                          `}
                          >
                            <Link
                              to={release.docs}
                              aria-label={`Read documentation for ${release.heading}`}
                            >
                              Read Documentation
                            </Link>
                          </li>
                          <li className="">
                            <Link
                              to={release.githubLink}
                              aria-label={`Visit GitHub release for ${release.heading}`}
                            >
                              Visit GitHub
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </Section>
            </Section>
          </div>
        </div>

        <div className="mb-20 sm:mb-32 md:mb-40" />

        <div className="index__signup">
          <div className="container">
            <SectionSignup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;

export let action: ActionFunction = async (props) => {
  return signupAction(props);
};

function SectionHeader({
  heading,
  children,
  content,
  className,
}: {
  heading: React.ReactNode;
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(className, "text-center m-auto max-w-3xl")}>
      <Heading className="">{heading}</Heading>
      <p className="opacity-80 text-lg leading-8 md:text-xl">{content}</p>
      {children}
    </div>
  );
}
