import * as React from "react";
import { ButtonLink } from "../components/button";
import { Section, Heading } from "../components/section-heading";
import type { RouteComponent, MetaFunction } from "remix";
import { IconBox } from "~/components/icon-box";
import { Badge } from "~/components/badge";
import { Link, ArrowLink } from "~/components/link";
import {
  IconGithub,
  IconStackOverflow,
  IconTwitter,
  IconYoutube,
  IconArrowRight,
} from "~/components/icons";
import { Card, CardContent, CardImage } from "~/components/card";

const meta: MetaFunction = () => ({
  title: "React Router | Resources",
});

const ResourcesPage: RouteComponent = () => {
  return (
    <div className="py-8">
      <div className="resources__hero">
        <div className="contain">
          <div
            className={`
              text-center md:text-left
              mx-auto md:mx-0
              my-24 md:my-32 lg:mt-36
              max-w-xl
            `}
          >
            <h1 className="title mb-7">Resources for Developers</h1>
            <p className="opacity-80 text-lg leading-8 md:text-xl">
              React Router is built and maintained by our community of
              like-minded developers. We have over 2.4 million contributors and
              active moderators to help you implement your code.
            </p>
            <div
              className={`
                flex flex-col md:flex-row
                items-center justify-center md:justify-start
                flex-shrink-0 flex-wrap
                mt-7
              `}
            >
              <ButtonLink size="large" to="/" className="mb-4 md:mb-0 md:mr-6">
                Visit GitHub Project
              </ButtonLink>
              <ButtonLink size="large" to="/">
                Join Discord Channel
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <div className="resources__links">
        <div className="contain">
          <Section as="section">
            <div className="">
              <Heading className="">Around the Web</Heading>
              <p className="opacity-80 text-lg leading-8 md:text-xl">
                Follow the Remix team for the latest updates on our React tools
                and applications
              </p>
            </div>
            <dl className={``}>
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
                  linkTo: "/",
                  linkLabel: "Visit Stack Overflow",
                },
              ].map(({ icon, title, desc, linkLabel, linkTo }) => {
                return (
                  <div key={title}>
                    <IconBox
                      icon={icon}
                      className="bg-[color:var(--base07)] text-[color:var(--base00)]"
                    />
                    <dt className="h3">{title}</dt>
                    <dd>
                      <div className="opacity-80">{desc}</div>
                      <div>
                        <ArrowLink
                          to={linkTo}
                          className={`
                            inline-flex mt-6
                            items-center
                            font-semibold
                            text-[color:var(--base07)]
                          `}
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

      <div className="resources__projects">
        <div className="contain">
          <Section as="section">
            <div className="">
              <Heading className="">Open Source Projects</Heading>
              <p className="opacity-80 text-lg leading-8 md:text-xl">
                Apps and libraries from the Remix team to use alongside React
                Router
              </p>
            </div>
            <Section
              as="div"
              className="grid grid-cols-1 grid-flow-row sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  imgSrc: "/hero.png",
                  imgAlt: "TODO",
                  heading: "Remix",
                  content: `A new React framework that supports dynamic routing and more.`,
                  linkTo: "https://remix.run",
                  linkText: "Visit Remix",
                },
                {
                  imgSrc: "/hero.png",
                  imgAlt: "TODO",
                  heading: "Reach UI",
                  content: `An accessible foundation for React applications and design systems.`,
                  linkTo: "https://reach.tech",
                  linkText: "Visit Reach UI",
                },
                {
                  imgSrc: "/hero.png",
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
                      {/* TODO: Align links to the bottom of cards in each row */}
                    </CardContent>
                  </Card>
                );
              })}
            </Section>
          </Section>
        </div>
      </div>

      <div className="resources__versions">
        <div className="contain">
          <Section as="section">
            <div className="">
              <Heading className="">Version Downloads</Heading>
              <p className="opacity-80 text-lg leading-8 md:text-xl">
                Free and open-source code for developers to use
              </p>
            </div>
            <Section
              as="div"
              className="grid grid-cols-1 grid-flow-row max-w-xl"
            >
              {[
                // TODO: Get versions from releases
                {
                  heading: "React Router v6",
                  date: "September 2020",
                  docs: "/",
                  githubLink: "/",
                },
                {
                  heading: "React Router v5",
                  date: "September 2021",
                  docs: "/",
                  githubLink: "/",
                },
                {
                  heading: "React Router v4",
                  date: "September 2021",
                  docs: "/",
                  githubLink: "/",
                },
              ].map((release, i, arr) => {
                return (
                  <div key={release.heading}>
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
    </div>
  );
};

export default ResourcesPage;
export { meta };
