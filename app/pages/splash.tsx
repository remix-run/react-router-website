import { Await, Link } from "react-router";
import { Suspense } from "react";

import iconsHref from "~/icons.svg";
import { getStats } from "~/modules/stats";
import type { Route } from "./+types/splash";

export let loader = async () => {
  const stats = getStats();
  return { stats };
};

export const meta: Route.MetaFunction = ({ matches }) => {
  let { isProductionHost } = matches[0].data;
  let robots = isProductionHost ? "index,follow" : "noindex, nofollow";
  return [
    { title: "React Router Official Documentation" },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
};

type Highlight = {
  icon: string;
  title: string;
  description: string;
};
const highlights: Highlight[] = [
  {
    icon: "chain",
    title: "Non-breaking",
    description:
      "Upgrading from v6 to v7 is a non-breaking upgrade. Keep using React Router the same way you already do.",
  },
  {
    icon: "box",
    title: "Bridge to React 19",
    description:
      "All new bundling, server rendering, pre-rendering, and streaming features allow you bridge the gap from React 18 to 19 incrementally.",
  },
  {
    icon: "cd",
    title: "Type Safety",
    description:
      "New typegen provides first class types for route params, loader data, actions, and more.",
  },
];

const prefix = "/"; // TODO
type Adventure = {
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
};
const adventures: Adventure[] = [
  {
    title: "I'm new!",
    description: "Learn how to get the most out of React Router",
    linkText: "Start Here",
    linkTo: prefix + "home",
  },
  {
    title: "I'm on v6",
    description: "Upgrade to v7 in just a few steps",
    linkText: "Upgrade Now",
    linkTo: prefix + "upgrading/v6",
  },
  {
    title: "I want to adopt framework features",
    description:
      "Learn how to adopt the new framework features in your existing React Router app",
    linkText: "Adopt Framework Features",
    linkTo: prefix + "upgrading/component-routes",
  },
  {
    title: "I'm stuck",
    description: "Join GitHub discussions for help",
    linkText: "Get Help",
    linkTo: "https://rmx.as/discord",
  },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-full w-full flex-col items-center justify-center">
      <section className="from-23% via-82% flex w-full flex-col items-center gap-y-12 bg-gradient-to-b from-[#CCD2DE] via-[#D9DDE6] to-[#FAFBFD] to-100% py-[96px] md:py-[160px]">
        <h1>
          <img
            src="/splash/hero-3d-logo.webp"
            alt="React Router logo, nine dots in an upward triangle (one on top, two in the middle, three on the bottom) with a path of three highlighted and connected from top to bottom, next to the text React Router"
            className="aspect-[32/5] w-[360px] md:w-[480px] lg:w-[640px] 2xl:w-[960px]"
          />
        </h1>
        <p className="mx-12 max-w-[540px] text-center text-xl text-gray-700 md:mx-0">
          A user‑obsessed, standards‑focused, multi‑strategy router you can
          deploy anywhere.
        </p>
      </section>
      <section className="flex w-full flex-col items-center gap-y-24 bg-gradient-to-b from-[#FAFBFD] to-white px-12 pb-12 md:gap-y-16 lg:gap-y-12">
        <div className="grid gap-x-16 gap-y-6 md:grid-flow-col">
          <img
            src="/splash/v7-badge-1.svg"
            className="h-[52px] w-[140px] md:h-[72px] md:w-[194px]"
          />
          <img
            src="/splash/v7-badge-2.svg"
            className="h-[52px] w-[140px] md:h-[72px] md:w-[194px]"
          />
        </div>
        <h2 className="text-center text-3xl font-semibold text-gray-800">
          What to expect from this version:
        </h2>
        <dl className="grid max-w-[540px] gap-x-12 gap-y-6 lg:max-w-5xl lg:grid-flow-col">
          {highlights.map(({ icon, title, description }) => (
            <div key={title} className="relative flex flex-col gap-2 pl-14">
              <dt className="text-xl font-semibold text-gray-800">
                <svg className="absolute left-0 top-0 h-8 w-8">
                  <use href={`${iconsHref}#${icon}`} />
                </svg>
                {title}
              </dt>
              <dd className="text-[#757575]">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="flex flex-col gap-y-12 p-12">
        <h2 className="mx-[-10px] text-center text-3xl font-semibold text-gray-800">
          Choose Your Adventure:
        </h2>
        <div className="grid max-w-[1200px] gap-6 md:grid-cols-2 2xl:grid-cols-4">
          {adventures.map(({ title, description, linkText, linkTo }) => (
            <Link
              key={title}
              to={linkTo}
              className="flex flex-col justify-between gap-y-6 rounded-lg border border-[#D9D9D9] p-8 hover:bg-gray-50"
            >
              <div className="flex flex-col gap-y-4">
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="text-[#757575]">{description}</p>
              </div>
              <p className="flex h-10 place-content-center place-items-center rounded-lg bg-gray-900 text-gray-50">
                {linkText}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid w-full place-content-center bg-gray-50 p-12">
        <Suspense fallback={null}>
          <Await resolve={loaderData.stats} errorElement={null}>
            {(stats) => (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2">
                {stats.map(({ svgId, count, label }) => (
                  <div key={svgId} className="flex w-[308px] gap-2">
                    <svg className="h-8 w-8 text-gray-600 ">
                      <use href={`${iconsHref}#${svgId}`} />
                    </svg>
                    <div className="flex flex-col">
                      <dd className="text-2xl font-semibold text-gray-700">
                        {count?.toLocaleString("en-US")}
                      </dd>
                      <dt className="text-gray-400">{label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </Await>
        </Suspense>
      </section>
      <section className="grid h-[205px] w-full place-content-center place-items-center gap-y-6 bg-gray-900 p-12">
        <img src="/splash/shopify-badge.svg" className="h-[68px] w-[190px]" />
        <p className="text-sm text-gray-400">© 2024 Shopify, Inc.</p>
      </section>
    </main>
  );
}
