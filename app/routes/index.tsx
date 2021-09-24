import * as React from "react";
import { Form, useTransition, useActionData } from "remix";
import cx from "clsx";
import { Section, Heading } from "~/components/section-heading";
import { Button, ButtonLink, ButtonDiv } from "~/components/button";
import { Link, ArrowLink } from "~/components/link";
import {
  IconLayers,
  IconNavigation,
  IconPlay,
  IconProtection,
  IconZoom,
} from "~/components/icons";
import { Field } from "~/components/form";
import type {
  RouteComponent,
  MetaFunction,
  LoaderFunction,
  ActionFunction,
} from "remix";
import {
  BrowserChrome,
  FastbooksApp,
  FastbooksSales,
  FastbooksInvoices,
  FastbooksInvoice,
} from "../components/scroll-experience";
import { Actor, ScrollStage } from "~/stage";

const meta: MetaFunction = () => ({
  title: "React Router",
});

const IndexPage: RouteComponent = () => {
  let actionData = useActionData();
  let transition = useTransition();

  return (
    <div className="py-8">
      <div className="index__hero">
        <div className="container">
          <div className="text-center mx-auto my-24 md:my-32 lg:mt-36 max-w-xl">
            <h1 className="title mb-7">
              React Router
              <br />
              v6 is Here
            </h1>
            <p className="opacity-80 text-lg leading-8 md:text-xl">
              Components are the heart of React's powerful programming model.
              React Router is a collection of navigational components that
              compose declaratively with your application.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center flex-shrink-0 flex-wrap mt-7">
              <ButtonLink
                size="large"
                to="/docs"
                className="mb-4 md:mb-0 md:mr-6"
              >
                Read the Docs
              </ButtonLink>
              <ButtonLink
                size="large"
                to="/docs/en/v6/getting-started/tutorial/"
              >
                Do the Tutorial
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
          <ScrollStage pages={4}>
            <div className="sticky top-1/3">
              <Actor start={0} end={1 / 5}>
                <BrowserChrome url="https://example.com/sales/invoices/102000">
                  <FastbooksApp>
                    <FastbooksSales>
                      <FastbooksInvoices>
                        <FastbooksInvoice />
                      </FastbooksInvoices>
                    </FastbooksSales>
                  </FastbooksApp>
                </BrowserChrome>
              </Actor>

              <Actor start={1 / 5} end={2 / 5}>
                <BrowserChrome url="https://example.com/sales/invoices/102000">
                  <FastbooksApp highlight>
                    <FastbooksSales>
                      <FastbooksInvoices>
                        <FastbooksInvoice />
                      </FastbooksInvoices>
                    </FastbooksSales>
                  </FastbooksApp>
                </BrowserChrome>
              </Actor>

              <Actor start={2 / 5} end={3 / 5}>
                <BrowserChrome url="https://example.com/sales/invoices/102000">
                  <FastbooksApp>
                    <FastbooksSales highlight>
                      <FastbooksInvoices>
                        <FastbooksInvoice />
                      </FastbooksInvoices>
                    </FastbooksSales>
                  </FastbooksApp>
                </BrowserChrome>
              </Actor>

              <Actor start={3 / 5} end={4 / 5}>
                <BrowserChrome url="https://example.com/sales/invoices/102000">
                  <FastbooksApp>
                    <FastbooksSales>
                      <FastbooksInvoices highlight>
                        <FastbooksInvoice />
                      </FastbooksInvoices>
                    </FastbooksSales>
                  </FastbooksApp>
                </BrowserChrome>
              </Actor>

              <Actor start={4 / 5} end={2}>
                <BrowserChrome url="https://example.com/sales/invoices/102000">
                  <FastbooksApp>
                    <FastbooksSales>
                      <FastbooksInvoices>
                        <FastbooksInvoice highlight />
                      </FastbooksInvoices>
                    </FastbooksSales>
                  </FastbooksApp>
                </BrowserChrome>
              </Actor>
            </div>
          </ScrollStage>

          <div className="hidden">
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
                  desc: "600+",
                  tooltip: "Over 656 contributors",
                },
                {
                  title: "npm Downloads",
                  desc: "3.6m",
                  tooltip: "3.6 million npm downloads",
                },
                {
                  title: "of React Apps",
                  desc: "70%",
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
              <Form
                replace
                method="post"
                className="flex flex-col xs:flex-row"
                onSubmit={(event) => {
                  if (transition.state === "submitting") {
                    event.preventDefault();
                  }
                }}
              >
                <label className="contents">
                  <span className="sr-only">Email address</span>
                  <Field
                    type="email"
                    name="email"
                    placeholder="billybob@remix.run"
                    className="mb-4 xs:mb-0 xs:mr-4"
                    disabled={transition.state === "submitting"}
                  />
                </label>
                <Button disabled={transition.state === "submitting"}>
                  Subscribe
                </Button>
              </Form>
              {/* TODO: Needs an aria live announcement */}
              {actionData?.subscription?.state ? (
                <Status color="green" className="mt-4">
                  {(() => {
                    switch (actionData.subscription.state) {
                      case "inactive":
                        return "Signup successful! Please check your email to confirm your subscription.";
                      case "active":
                      // we shouldn't get here...
                      case "cancelled":
                      default:
                        return "Signup successful! Keep an eye on your inbox for updates.";
                    }
                  })()}
                </Status>
              ) : null}
              {/* TODO: Error handling */}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
export { meta };

export let loader: LoaderFunction = async () => {
  return null;
};

export let action: ActionFunction = async ({ request }) => {
  const TOKEN = process.env.CONVERTKIT_KEY;
  const URL = "https://api.convertkit.com/v3";
  const FORM_ID = "1334747";

  try {
    let body = new URLSearchParams(await request.text());
    let email = body.get("email");

    // TODO: Validate email

    if (!email) {
      return new Response(null, {
        status: 400,
        statusText: "Missing email address",
      });
    }

    if (request.method.toLowerCase() !== "post") {
      return new Response(null, {
        status: 405,
        statusText: `Expected "POST", received "${request.method.toUpperCase()}"`,
      });
    }

    let res = await fetch(`${URL}/forms/${FORM_ID}/subscribe`, {
      method: request.method,
      body: JSON.stringify({
        api_key: TOKEN,
        email,
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Response(null, {
      status: 500,
      statusText: `Egads! Something went wrong!`,
    });
  }
};

function Status({
  className,
  children,
  color = "green",
}: {
  className?: string;
  children: React.ReactNode;
  color: "green" | "yellow" | "red";
}) {
  return (
    <div
      className={cx(className, "p-3 font-semibold rounded", {
        "bg-green-500/20 text-green-500": color === "green",
        "bg-yellow-200/70 text-yellow-900": color === "yellow",
        "bg-red-500/20 text-red-500": color === "red",
      })}
    >
      {children}
    </div>
  );
}
