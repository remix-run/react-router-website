import * as React from "react";
import type { RouteComponent, MetaFunction } from "remix";
import cx from "clsx";
import { Field, Radio, Checkbox, Select } from "../components/form";
import { Section, Heading } from "../components/section-heading";
import { ButtonLink, ButtonDiv } from "../components/button";
import { Link } from "remix";

const meta: MetaFunction = () => ({
  title: "React Router",
});

const IndexPage: RouteComponent = () => {
  return (
    <div className="contain py-8">
      <div className="index__hero">
        <div className="text-center mx-auto my-24 md:my-32 lg:mt-36 max-w-[566px]">
          <h1 className="title mb-7">
            Learn Once.
            <br />
            Route Anywhere.
          </h1>
          <p className="text-[color:var(--base05)] text-lg leading-8 md:text-xl">
            Components are the heart of React's powerful programming model.
            React Router is a collection of navigational components that compose
            declaratively with your application.
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
                className="inline-flex items-center bg-black/80 group-hover:bg-black group-hover:text-[color:var(--base07)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
              >
                <IconPlay color="var(--base0D)" className="mr-3" />
                <span>See how React Router works</span>
              </ButtonDiv>
            </Link>
          </div>
        </div>
      </div>

      <div className="index__sponsors">
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
                    <IconZoom />
                    {/* i !== arr.length - 1 && <div className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12" /> */}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="index__features">
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
            <Section wrap className="my-56 md:my-72 lg:my-80">
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
                <Link
                  to={section.link}
                  className={cx(
                    "text-lg md:text-xl inline-flex items-center font-semibold outline-none focus:ring-2 focus:ring-opacity-60 focus:ring-offset-4 focus:ring-offset-black",
                    {
                      "text-blue-500": section.color === "blue",
                      "text-green-500": section.color === "green",
                      "text-red-500": section.color === "red",
                      "focus:ring-blue-500": section.color === "blue",
                      "focus:ring-green-500": section.color === "green",
                      "focus:ring-red-500": section.color === "red",
                    }
                  )}
                >
                  <span className="mr-3">Learn More</span>
                  <ArrowRight aria-hidden />
                </Link>
              </div>
            </Section>
          );
        })}
      </div>

      <div className="index__stats">
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

      <div className="index__signup">
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
  );
};

export default IndexPage;
export { meta };

function IconZoom(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      width="108"
      height="24"
      viewBox="0 0 108 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M87.6117 7.19698C88.0199 7.9013 88.1535 8.70265 88.1976 9.60353L88.2555 10.8043V19.2008L88.3148 20.4028C88.4332 22.3658 89.8809 23.8173 91.8591 23.9408L93.0548 24V10.8043L93.114 9.60353C93.1631 8.71273 93.2954 7.89626 93.71 7.1869C94.1324 6.45931 94.7388 5.85564 95.4682 5.43652C96.1977 5.0174 97.0246 4.79757 97.8659 4.7991C98.7073 4.80063 99.5334 5.02347 100.261 5.44525C100.989 5.86703 101.593 6.47289 102.013 7.20202C102.421 7.90634 102.549 8.72281 102.598 9.60353L102.657 10.8005V19.2008L102.716 20.4028C102.84 22.3759 104.276 23.8274 106.261 23.9408L107.456 24V9.60353C107.456 7.05784 106.445 4.61636 104.646 2.81593C102.846 1.0155 100.405 0.00352562 97.8591 0.00252332C96.4965 0.00108641 95.1494 0.290434 93.9076 0.851234C92.6659 1.41203 91.5581 2.23138 90.6583 3.25452C89.7581 2.23178 88.6503 1.41264 87.4086 0.851669C86.167 0.290702 84.82 0.000794403 83.4576 0.00126311C81.4643 0.00126311 79.6146 0.606051 78.0825 1.65057C77.1476 0.607311 75.056 0.00126311 73.8553 0.00126311V24L75.056 23.9408C77.0644 23.8085 78.5159 22.3961 78.5941 20.4028L78.6583 19.2008V10.8043L78.7175 9.60353C78.7679 8.69761 78.8939 7.9013 79.3034 7.19194C79.7262 6.4648 80.3323 5.86128 81.0612 5.44164C81.7902 5.02201 82.6164 4.80094 83.4576 4.80051C84.2993 4.80069 85.1262 5.0222 85.8553 5.44282C86.5844 5.86344 87.1902 6.46839 87.6117 7.19698ZM5.45757 23.942L6.65832 24H24.6571L24.5978 22.803C24.4353 20.8299 23.038 19.3885 21.0586 19.26L19.8578 19.2008H9.05984L23.4563 4.79925L23.3971 3.60353C23.3038 1.61025 21.8473 0.1701 19.8578 0.0604815L18.6571 0.0063029L0.658325 0.00126311L0.717544 1.20202C0.875041 3.15624 2.29251 4.62789 4.25555 4.74129L5.45757 4.80051H16.2556L1.85908 19.202L1.9183 20.4028C2.03674 22.3809 3.46429 23.8135 5.45757 23.9408V23.942ZM69.1442 3.51407C70.2587 4.62829 71.1427 5.95114 71.7459 7.40706C72.3491 8.86298 72.6595 10.4235 72.6595 11.9994C72.6595 13.5753 72.3491 15.1358 71.7459 16.5917C71.1427 18.0476 70.2587 19.3705 69.1442 20.4847C66.8927 22.7344 63.84 23.9982 60.6571 23.9982C57.4741 23.9982 54.4214 22.7344 52.1699 20.4847C47.484 15.7988 47.484 8.19992 52.1699 3.51407C53.2833 2.40023 54.6052 1.5166 56.0602 0.913655C57.5151 0.310708 59.0746 0.000248732 60.6495 2.89265e-06C62.227 -0.00109231 63.7892 0.30882 65.2468 0.912014C66.7044 1.51521 68.0288 2.39985 69.1442 3.51533V3.51407ZM65.7486 6.91222C67.0983 8.26294 67.8565 10.0943 67.8565 12.0038C67.8565 13.9133 67.0983 15.7446 65.7486 17.0953C64.3979 18.445 62.5665 19.2032 60.6571 19.2032C58.7476 19.2032 56.9162 18.445 55.5655 17.0953C54.2158 15.7446 53.4576 13.9133 53.4576 12.0038C53.4576 10.0943 54.2158 8.26294 55.5655 6.91222C56.9162 5.56253 58.7476 4.80436 60.6571 4.80436C62.5665 4.80436 64.3979 5.56253 65.7486 6.91222ZM35.4651 2.89265e-06C37.0401 0.000414204 38.5996 0.311072 40.0546 0.914237C41.5095 1.5174 42.8314 2.40126 43.9448 3.51533C48.6319 8.19992 48.6319 15.8001 43.9448 20.4847C41.6932 22.7344 38.6405 23.9982 35.4576 23.9982C32.2746 23.9982 29.2219 22.7344 26.9704 20.4847C22.2845 15.7988 22.2845 8.19992 26.9704 3.51407C28.0838 2.40023 29.4057 1.5166 30.8607 0.913655C32.3156 0.310708 33.8751 0.000248732 35.45 2.89265e-06H35.4651ZM40.5491 6.9097C41.8992 8.26048 42.6576 10.0921 42.6576 12.0019C42.6576 13.9117 41.8992 15.7433 40.5491 17.0941C39.1984 18.4438 37.367 19.2019 35.4576 19.2019C33.5481 19.2019 31.7167 18.4438 30.366 17.0941C29.0163 15.7434 28.2581 13.912 28.2581 12.0025C28.2581 10.093 29.0163 8.26168 30.366 6.91096C31.7167 5.56127 33.5481 4.8031 35.4576 4.8031C37.367 4.8031 39.1984 5.56127 40.5491 6.91096V6.9097Z"
        fill="white"
      />
    </svg>
  );
}

function ArrowRight({
  color = "currentColor",
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & { color?: string }) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1 6H15M15 6L9.75 1M15 6L9.75 11"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function IconNavigation({
  color = "currentColor",
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & { color?: string }) {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M27.631 16.1506C25.8059 14.2709 22.8467 14.2709 21.0216 16.1506C19.5122 17.7052 19.2173 20.1154 20.3051 22.007L23.3172 27.2451H6.14315C4.66215 27.2451 3.45727 26.0041 3.45727 24.4788C3.45727 22.9535 4.66215 21.7126 6.14315 21.7126H14.22C16.6315 21.7126 18.5934 19.692 18.5934 17.2084C18.5934 14.7247 16.6315 12.7042 14.22 12.7042H5.88272L8.89485 7.46612C9.98261 5.57456 9.68769 3.16427 8.17834 1.60976C6.35319 -0.269985 3.39405 -0.269985 1.5689 1.60976C0.0595444 3.16421 -0.235374 5.5745 0.852389 7.46606L4.87365 14.459L4.88332 14.4422H14.22C15.701 14.4422 16.9059 15.6831 16.9059 17.2084C16.9059 18.7337 15.701 19.9746 14.22 19.9746H6.14315C3.73166 19.9746 1.76977 21.9952 1.76977 24.4788C1.76977 26.9625 3.73166 28.9831 6.14315 28.9831H24.3166L24.3263 29L28.3475 22.0071C29.4353 20.1154 29.1404 17.7052 27.631 16.1506ZM4.87359 6.53068C4.06123 6.53068 3.40035 5.85003 3.40035 5.01337C3.40035 4.1767 4.06123 3.49605 4.87359 3.49605C5.68595 3.49605 6.34684 4.1767 6.34684 5.01337C6.34684 5.85003 5.68595 6.53068 4.87359 6.53068ZM24.2631 21.0716C23.4508 21.0716 22.7899 20.391 22.7899 19.5543C22.7899 18.7176 23.4508 18.037 24.2631 18.037C25.0755 18.037 25.7364 18.7176 25.7364 19.5543C25.7364 20.391 25.0755 21.0716 24.2631 21.0716Z"
        fill={color}
      />
    </svg>
  );
}

function IconProtection({
  color = "currentColor",
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & { color?: string }) {
  return (
    <svg
      width="30"
      height="36"
      viewBox="0 0 30 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M29.3639 9.71154C29.3229 8.81128 29.3229 7.95194 29.3229 7.0926C29.3229 6.39695 28.791 5.86498 28.0953 5.86498C22.9802 5.86498 19.0927 4.39182 15.86 1.24092C15.3689 0.790788 14.6323 0.790788 14.1413 1.24092C10.9086 4.39182 7.02107 5.86498 1.90596 5.86498C1.21031 5.86498 0.678337 6.39695 0.678337 7.0926C0.678337 7.95194 0.678337 8.81128 0.637416 9.71154C0.473733 18.3049 0.228207 30.0901 14.5914 35.0415L15.0006 35.1234L15.4098 35.0415C29.7321 30.0901 29.5275 18.3458 29.3639 9.71154ZM14.0185 21.6195C13.773 21.8241 13.4866 21.9469 13.1592 21.9469H13.1183C12.7909 21.9469 12.4635 21.7832 12.2589 21.5377L8.4533 17.3228L10.2947 15.686L13.282 19.0006L19.9111 12.6988L21.5889 14.4993L14.0185 21.6195Z"
        fill={color}
      />
    </svg>
  );
}

function IconLayers({
  color = "currentColor",
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & { color?: string }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M28.9489 14.1478C28.9198 14.1284 28.8899 14.1104 28.859 14.094L26.8152 12.9935L15.4814 18.9941C15.1803 19.1536 14.8198 19.1536 14.5187 18.9941L3.18488 12.9935L1.14108 14.094C0.644348 14.3577 0.455349 14.9741 0.71902 15.4708C0.735413 15.5017 0.753373 15.5317 0.772839 15.5607L15 23.093L29.2272 15.5607C29.5405 15.0937 29.4159 14.4612 28.9489 14.1478Z"
        fill={color}
      />
      <path
        d="M29.2756 20.682C29.1803 20.5055 29.0354 20.3607 28.859 20.2655L26.8152 19.1649L15.4814 25.1656C15.1803 25.3251 14.8198 25.3251 14.5187 25.1656L3.18484 19.1649L1.14104 20.2655C0.64112 20.5353 0.454651 21.1592 0.72447 21.6592C0.819753 21.8357 0.964577 21.9805 1.14104 22.0757L14.5125 29.2757C14.8168 29.4396 15.1832 29.4396 15.4875 29.2757L28.859 22.0757C29.3588 21.8059 29.5454 21.182 29.2756 20.682Z"
        fill={color}
      />
      <path
        d="M28.9489 7.97674C28.9198 7.95727 28.8899 7.93931 28.859 7.92292L15.4876 0.722907C15.1832 0.559039 14.8169 0.559039 14.5125 0.722907L1.14108 7.92292C0.644348 8.18659 0.455349 8.80301 0.71902 9.29974C0.735413 9.3306 0.753373 9.36061 0.772839 9.38966L15 16.9219L29.2272 9.38966C29.5405 8.92264 29.4159 8.29007 28.9489 7.97674Z"
        fill={color}
      />
    </svg>
  );
}

function IconPlay({
  color = "currentColor",
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & { color?: string }) {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.3433 7.14832C13.9778 7.5388 13.9778 8.46115 13.3433 8.85164L2.06951 15.7893C1.40324 16.1994 0.54541 15.72 0.54541 14.9377V1.06227C0.54541 0.27995 1.40324 -0.199401 2.06951 0.210611L13.3433 7.14832Z"
        fill={color}
      />
    </svg>
  );
}
