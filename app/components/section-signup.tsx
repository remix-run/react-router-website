import * as React from "react";
import { Form, useActionData, useTransition } from "remix";
import type { ActionFunction } from "remix";
import cx from "clsx";
import { Section, Heading } from "~/components/section-heading";
import { Field } from "~/components/form";
import { Button } from "~/components/button";

function SectionSignup() {
  let actionData = useActionData();
  let transition = useTransition();

  return (
    <Section wrap className="section-signup relative my-36 md:my-64 lg:my-72">
      <div className="section-signup__image flex items-center justify-center overflow-hidden md:justify-end p-8 md:p-0 mb-6 md:mb-0 rounded-xl md:rounded-3xl md:absolute md:w-[1416px] md:h-[584px] md:right-[40rem] md:top-1/2 md:-translate-y-1/2">
        <img
          src="/discord-screen.png"
          alt="Screenshot of the Remix Discord channel"
          height="456"
          width="630"
          className="w-full h-auto md:w-[630px] md:h-[456px] md:mr-24"
        />
      </div>
      <div className="md:max-w-xl md:mr-0 md:ml-auto md:py-40 relative">
        <Heading className="mb-1">Stay Connected</Heading>
        <p className="text-lg md:text-xl mb-6 opacity-80">
          React Router is developed by the <a href="https://remix.run">Remix</a>{" "}
          team. To get updates and special content on React Router (as well as
          our other projects), subscribe to the Remix newsletter or join the{" "}
          <a href="#">conversation on Discord</a>.
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
        <p className="text-gray-300 text-sm mt-1">
          We respect your privacy, unsubscribe at any time.
        </p>
        {/* TODO: Needs an aria live announcement */}
        {actionData?.subscription?.state ? (
          <Status color="green" className="mt-4 w-full md:absolute md:left-0">
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
  );
}

const signupAction: ActionFunction = async ({ request }) => {
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

export { SectionSignup, signupAction };

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
