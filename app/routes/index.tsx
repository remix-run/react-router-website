import * as React from "react";
import type { Page, Sequence } from "@ryanflorence/mdtut";
import cx from "clsx";
import { json } from "remix";
import { CACHE_CONTROL } from "~/utils/http";
import { processMdt } from "~/utils/mdt";
import { Section } from "~/components/section-heading";
import { ButtonLink } from "~/components/button";
import indexStyles from "~/styles/index.css";
import {
  IconAirbnb,
  IconApple,
  IconCoinbase,
  IconDiscord,
  IconMicrosoft,
  IconNetflix,
  IconTwitter,
  IconZoom,
} from "~/components/icons";
import {
  RouteComponent,
  MetaFunction,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  LinksFunction,
} from "remix";
import {
  BrowserChrome,
  FastbooksApp,
  FastbooksSales,
  FastbooksInvoices,
  FastbooksInvoice,
} from "../components/scroll-experience";
import { Actor, ScrollStage, useStage } from "~/stage";
import { SectionSignup, signupAction } from "~/components/section-signup";
import { useMatchMedia } from "../hooks/match-media";
import { seo } from "~/utils/seo";

let [seoMeta, seoLinks] = seo({
  title: "Declarative routing for React apps at any scale",
  description:
    "Version 6 of React Router is here! React Router v6 takes the best features from v3, v5, and its sister project, Reach Router, in our smallest and most powerful package yet.",
  twitter: {
    creator: "@remix_run",
  },
  openGraph: {},
});

export const meta: MetaFunction = () => ({
  ...seoMeta,
});

export const links: LinksFunction = () => [
  ...seoLinks,
  { rel: "stylesheet", href: indexStyles },
];

const brandIcons = [
  {
    name: "apple",
    icon: <IconApple className="w-[40px] h-auto" />,
  },
  {
    name: "netflix",
    icon: <IconNetflix className="w-[160px] h-auto" />,
  },
  {
    name: "microsoft",
    icon: <IconMicrosoft className="w-[220px] h-auto" />,
  },
  {
    name: "airbnb",
    icon: <IconAirbnb className="w-[180px] h-auto" />,
  },
  {
    name: "twitter",
    icon: <IconTwitter className="w-[52px] h-auto" />,
  },
  {
    name: "discord",
    icon: <IconDiscord className="w-[220px] h-auto" />,
  },
  {
    name: "coinbase",
    icon: <IconCoinbase className="w-[170px] h-auto" />,
  },
  {
    name: "zoom",
    icon: <IconZoom className="w-[130px] h-auto" />,
  },
];

function Marquee({
  shouldScroll = true,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { shouldScroll?: boolean }) {
  let prefersReducedMotion = useMatchMedia(`(prefers-reduced-motion)`);
  return prefersReducedMotion || !shouldScroll ? (
    <div {...props} />
  ) : (
    /* @ts-ignore */
    <marquee scrollamount={3} {...props} />
  );
}

function PersistentCode({
  slides,
  frames,
}: {
  slides: Sequence["slides"];
  frames: number[];
}) {
  let stage = useStage();
  let frame = frames.findIndex((frame, index, arr) => {
    let start = index === 0 ? 0 : frames[index - 1];
    let end = index - 1 === arr.length ? 1 : frame;
    return stage.progress >= start && stage.progress < end;
  });
  let slide = slides[frame] || slides[slides.length - 1];
  return <Code html={slide.subject} />;
}

export function RankedRoutes({
  className,
  mdt,
}: {
  className?: string;
  mdt: Page;
}) {
  // let [, , prose] = mdt as [null, null, Prose];
  return (
    <div
      className={cx(
        className,
        "max-w-2xl mx-auto my-32 md:my-72 lg:mb-80 lg:max-w-6xl lg:mt-96 container"
      )}
    >
      <h2 className="mb-4">Ranked Routes</h2>
      <div className="md-down:space-y-6 lg:grid lg:grid-cols-[1fr,1.4fr] xl:grid-cols-[1fr,1.2fr] lg:gap-7 xl:gap-10">
        <div>
          <div>
            <p className="mb-4">
              Sometimes a URL like can match more than one route pattern. React
              Router ranks your routes and picks the best one.
            </p>

            <p className="mb-4">
              If you are visiting{" "}
              <code className="whitespace-nowrap text-gray-300">
                https://myapp.com/teams/new
              </code>
              , React Router will render{" "}
              <code className="whitespace-nowrap text-green-300">
                {"<NewTeam />"}
              </code>{" "}
              because it's more specific than the{" "}
              <code className="whitespace-nowrap text-gray-300">:teamId</code>{" "}
              parameter. No more messing with <code>exact</code> props or
              careful (but fragile) route ordering!
            </p>
          </div>
        </div>
        <div>
          <div className="text-sm md:text-base overflow-hidden overflow-x-auto p-4 border rounded-lg bg-gray-950 border-gray-600">
            <pre
              className="overflow-x-auto sm:hidden"
              data-line-numbers="true"
              data-lang="tsx"
              style={{
                color: "var(--base05)",
              }}
              dangerouslySetInnerHTML={{
                __html: `<code><span class="codeblock-line" data-line-number="1">&lt;<span style="color: var(--base0A)">Routes</span>&gt;
</span><span class="codeblock-line" data-line-number="2">  &lt;<span style="color: var(--base0A)">Route</span>
    <span style="color: var(--base0D)">path</span><span style="color: var(--base0E)">=</span>"<span style="color: var(--base0B)">teams/:teamId</span>"
    <span style="color: var(--base0D)">element</span><span style="color: var(--base0E)">=</span><span style="color: var(--base0F)">{</span>&lt;<span style="color: var(--base0A)">Team</span> /&gt;<span style="color: var(--base0F)">}</span>
  /&gt;</span>
  <span class="codeblock-line" data-line-number="3">&lt;<span style="color: var(--base0A)">Route</span>
    <span style="color: var(--base0D)">path</span><span style="color: var(--base0E)">=</span>"<span style="color: var(--base0B)">teams/new</span>"
    <span style="color: var(--base0D)">element</span><span style="color: var(--base0E)">=</span><span style="color: var(--base0F)">{</span>&lt;<span style="color: var(--base0A)">NewTeam</span>/&gt;<span style="color: var(--base0F)">}</span>
  /&gt;
</span><span class="codeblock-line" data-line-number="4">&lt;/<span style="color: var(--base0A)">Routes</span>&gt;
</span></code>`,
              }}
            />
            <pre
              className="hidden sm:block overflow-x-auto"
              data-line-numbers="true"
              data-lang="tsx"
              style={{
                color: "var(--base05)",
              }}
              dangerouslySetInnerHTML={{
                __html: `<code><span class="codeblock-line" data-line-number="1">&lt;<span style="color: var(--base0A)">Routes</span>&gt;
</span><span class="codeblock-line" data-line-number="2">  &lt;<span style="color: var(--base0A)">Route</span> <span style="color: var(--base0D)">path</span><span style="color: var(--base0E)">=</span>"<span style="color: var(--base0B)">teams/:teamId</span>" <span style="color: var(--base0D)">element</span><span style="color: var(--base0E)">=</span><span style="color: var(--base0F)">{</span>&lt;<span style="color: var(--base0A)">Team</span> /&gt;<span style="color: var(--base0F)">}</span> /&gt;
</span><span class="codeblock-line" data-line-number="3">  &lt;<span style="color: var(--base0A)">Route</span> <span style="color: var(--base0D)">path</span><span style="color: var(--base0E)">=</span>"<span style="color: var(--base0B)">teams/new</span>" <span style="color: var(--base0D)">element</span><span style="color: var(--base0E)">=</span><span style="color: var(--base0F)">{</span>&lt;<span style="color: var(--base0A)">NewTeam</span> /&gt;<span style="color: var(--base0F)">}</span> /&gt;
</span><span class="codeblock-line" data-line-number="4">&lt;/<span style="color: var(--base0A)">Routes</span>&gt;
</span></code>`,
              }}
            />
          </div>
        </div>
      </div>
      {/* TODO: Fix this layout in the Markdown instead and rip off this bandaid! <div dangerouslySetInnerHTML={{ __html: prose.html }} /> */}
    </div>
  );
}

export function NestedRoutes({
  mdt,
  className,
}: {
  mdt: Page;
  className?: string;
}) {
  let [, { slides }] = mdt as [null, Sequence];
  let frames = [0.39, 0.51, 0.66, 0.78, 0.93];

  return (
    <div className={cx(className, "px-8 mt-32 pt-36 border-t border-gray-850")}>
      <ScrollStage pages={5 * 0.25 + 1}>
        <div className="scrollxp-nested">
          {slides.map((slide, index) => (
            <div className="h-[25vh] flex items-center text-black" key={index}>
              <div
                className="m-4 mx-auto max-w-md"
                dangerouslySetInnerHTML={{ __html: slide.html }}
              />
            </div>
          ))}
          <div className="text-center -mb-10">
            <ButtonLink
              size="large"
              to="/docs"
              style={{
                // When the button is focused it is centered in the veiwport if
                // the browser needs to scroll, and it will be obscured by the
                // fixed position graphic. This offset should fix that in most
                // modern browsers.
                scrollMarginBottom: 500,
              }}
            >
              Learn More<span className="sr-only"> about Nested Routes</span>
            </ButtonLink>
          </div>
        </div>
        <div className="mt-[25vh] max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto sticky bottom-[-2em]">
          {/* <ScrollLogger /> */}

          <PersistentCode slides={slides} frames={frames} />

          <Actor start={0} end={frames[0]}>
            <BrowserChrome url="about:blank" />
          </Actor>

          <Actor start={frames[0]} end={frames[1]}>
            <BrowserChrome url="example.com">
              <FastbooksApp highlight />
            </BrowserChrome>
          </Actor>

          <Actor start={frames[1]} end={frames[2]}>
            <BrowserChrome url="example.com/sales">
              <FastbooksApp>
                <FastbooksSales highlight>
                  {/* <FastbooksInvoices>
                    <FastbooksInvoice />
                  </FastbooksInvoices> */}
                </FastbooksSales>
              </FastbooksApp>
            </BrowserChrome>
          </Actor>

          <Actor start={frames[2]} end={frames[3]}>
            <BrowserChrome url="example.com/sales/invoices">
              <FastbooksApp>
                <FastbooksSales>
                  <FastbooksInvoices highlight />
                </FastbooksSales>
              </FastbooksApp>
            </BrowserChrome>
          </Actor>

          <Actor start={frames[3]} end={frames[4]}>
            <BrowserChrome url="example.com/sales/invoices/102000">
              <FastbooksApp>
                <FastbooksSales>
                  <FastbooksInvoices>
                    <FastbooksInvoice highlight />
                  </FastbooksInvoices>
                </FastbooksSales>
              </FastbooksApp>
            </BrowserChrome>
          </Actor>

          <Actor start={frames[4]} end={frames[5]}>
            <BrowserChrome url="example.com/sales/invoices/102000">
              <FastbooksApp>
                <FastbooksSales>
                  <FastbooksInvoices>
                    <FastbooksInvoice />
                  </FastbooksInvoices>
                </FastbooksSales>
              </FastbooksApp>
            </BrowserChrome>
          </Actor>
        </div>
      </ScrollStage>
      {/* push down from the negative margin on the browser */}
      <div className="h-48" />
    </div>
  );
}

function Code({ html }: { html: string }) {
  let ref = React.useRef<HTMLDivElement>(null);
  let [height, setHeight] = React.useState(0);
  React.useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, [html]);
  return (
    <div
      // TODO: Looks janky on phones, find a better way
      //   style={{
      //     transition: "height 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      //     height: height,
      //   }}
      className="box-border -mb-2 mx-8 border-t border-l border-r rounded-lg bg-gray-950 border-gray-600"
    >
      <div
        ref={ref}
        className={
          "text-xs md:text-sm lg:text-base xl:text-lg overflow-hidden overflow-x-auto px-4 pt-2 pb-4"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

const IndexPage: RouteComponent = () => {
  let { mdt } = useLoaderData<IndexData>();

  let isSmallScreen = useMatchMedia("screen and (max-width: 639px)", {
    initialState: false,
  });

  return (
    <div className="py-8">
      <div className="index__hero">
        <div className="container">
          <div className="text-center mx-auto my-20 md:mt-32 lg:mt-36 max-w-xl">
            <h1 className="title mb-7">
              React Router
              <br />
              v6 is Here
            </h1>
            <p className="opacity-80 text-lg leading-8 md:text-xl">
              Closing in on a decade of client-side routing, React Router v6
              takes the best features from previous versions—and its sister
              project, Reach Router—in our smallest and most powerful package
              yet.
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
                to="/docs/en/v6/getting-started/tutorial"
              >
                Start the Tutorial
              </ButtonLink>
            </div>
          </div>
          {/* <div className="max-w-[1084px] m-auto">
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
         */}
        </div>
      </div>

      <div className="index__sponsors">
        <div className="md:container max-w-full overflow-hidden md:max-w-5xl">
          <div className="text-center my-20 md:mb-32">
            <h2 className="eyebrow mb-6 md:mb-8">
              Used by dev teams at top companies
            </h2>
            <div className="sponsor-wrapper flex-gap-wrapper">
              <Marquee shouldScroll={isSmallScreen}>
                <ul
                  className={cx("sponsor-wrapper__list", [
                    "list-none",
                    "flex flex-shrink-0 flex-grow-0 flex-nowrap md:flex-wrap",
                    "flex-gap flex-gap-8 md:flex-gap-12 lg:flex-gap-14",
                    "items-center justify-center",
                  ])}
                >
                  {brandIcons.map(({ name, icon }) => {
                    return (
                      <li
                        key={name}
                        className="flex flex-shrink-0 flex-grow-0 items-center justify-center max-w-xs max-h-[80px]"
                      >
                        {icon}
                      </li>
                    );
                  })}
                </ul>
                {/* @ts-ignore */}
              </Marquee>
            </div>
          </div>
        </div>
      </div>

      <NestedRoutes className="index__nested-routes" mdt={mdt.nestedRoutes} />

      <RankedRoutes className="index__ranked-routes" mdt={mdt.nestedRoutes} />

      <div className="index__stats">
        <div className="container">
          <Section
            as="section"
            aria-label="Current user stats"
            className="my-32 md:my-72 lg:my-80"
          >
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
          <SectionSignup />
        </div>
      </div>
    </div>
  );
};

export default IndexPage;

interface IndexData {
  mdt: {
    nestedRoutes: Page;
  };
}

export let loader: LoaderFunction = async () => {
  let nestedRoutes = await processMdt("nested-routes-2.md");
  let data: IndexData = { mdt: { nestedRoutes } };
  return json(data, { headers: { "Cache-Control": CACHE_CONTROL } });
};

export let action: ActionFunction = async (props) => {
  return signupAction(props);
};
