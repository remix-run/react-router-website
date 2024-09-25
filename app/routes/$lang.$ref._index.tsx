import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import semver from "semver";
import {
  headers,
  loader as docLoader,
  default as DocPage,
  meta as docMeta,
} from "~/routes/$lang.$ref.$";
import iconsHref from "~/icons.svg";
import type { Stats } from "~/modules/stats";

export let loader = async ({ params, request }: LoaderFunctionArgs) => {
  let is6dot4 =
    params.ref === "local" ||
    params.ref === "main" ||
    params.ref === "dev" ||
    semver.satisfies(params.ref || "", "^6.4", { includePrerelease: true });
  if (is6dot4) {
    // const stats = await getStats();
    const stats = null;
    return json({ is6dot4: true, stats });
  }
  return docLoader({ request, params, context: {} });
};

export { headers };

export const meta: MetaFunction<typeof loader> = ({ data, ...rest }) => {
  // fake a doc for the new custom page, it does all the SEO stuff internally,
  // easier than repeating here
  if (data && "is6dot4" in data && data.is6dot4) {
    data = {
      doc: {
        attrs: {
          title: "Home",
        },
        children: [],
        filename: "",
        slug: "",
        html: "",
        headings: [],
      },
    };
  }

  // @ts-expect-error This is made because of the stub I think
  return docMeta({ data, ...rest });
};

const mainLinks = [
  {
    title: "What's New in 6.4?",
    description:
      "v6.4 is our most exciting release yet with new data abstractions for reads, writes, and navigation hooks to easily keep your UI in sync with your data. The new feature overview will catch you up.",
    slug: "start/overview",
    className: "text-green-brand",
    // prettier-ignore
    svg: (
      <div className="absolute top-[-35px] right-[-3px]">
        <svg width="107" height="85" viewBox="0 0 107 85" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="path-1-inside-1_1305_761" fill="white">
            <path fillRule="evenodd" clipRule="evenodd" d="M30.2112 60.7292C27.8371 57.4406 26.1169 54.2428 24.6141 51.4493C20.9709 44.677 18.6057 40.2804 11.3011 42.7245C-8.17874 49.2425 0.412893 8.93231 15.3645 16.3531C24.0327 20.6553 32.7413 18.5514 38.8087 16.623C46.0398 9.43895 56.0015 5 67 5C89.0914 5 107 22.9086 107 45C107 67.0914 89.0914 85 67 85C50.4928 85 36.3211 75.0009 30.2112 60.7292Z"/>
          </mask>
          <g className="fill-gray-50 dark:fill-gray-800 group-hover:fill-gray-100 dark:group-hover:fill-gray-700">
            <path fillRule="evenodd" clipRule="evenodd" d="M30.2112 60.7292C27.8371 57.4406 26.1169 54.2428 24.6141 51.4493C20.9709 44.677 18.6057 40.2804 11.3011 42.7245C-8.17874 49.2425 0.412893 8.93231 15.3645 16.3531C24.0327 20.6553 32.7413 18.5514 38.8087 16.623C46.0398 9.43895 56.0015 5 67 5C89.0914 5 107 22.9086 107 45C107 67.0914 89.0914 85 67 85C50.4928 85 36.3211 75.0009 30.2112 60.7292Z" />
            <path d="M30.2112 60.7292L32.9691 59.5485L32.8382 59.2428L32.6436 58.9732L30.2112 60.7292ZM24.6141 51.4493L21.9721 52.8706L24.6141 51.4493ZM11.3011 42.7245L12.253 45.5695L12.253 45.5695L11.3011 42.7245ZM15.3645 16.3531L14.0308 19.0403L14.0308 19.0403L15.3645 16.3531ZM38.8087 16.623L39.7174 19.4821L40.4086 19.2624L40.9231 18.7513L38.8087 16.623ZM32.6436 58.9732C30.3998 55.865 28.7637 52.8305 27.2561 50.028L21.9721 52.8706C23.4701 55.6551 25.2745 59.0161 27.7788 62.4851L32.6436 58.9732ZM27.2561 50.028C25.5407 46.8394 23.7594 43.4253 21.256 41.3301C19.8946 40.1907 18.2822 39.3889 16.3474 39.1307C14.4581 38.8785 12.465 39.1716 10.3492 39.8796L12.253 45.5695C13.7896 45.0554 14.8313 44.9815 15.5537 45.0779C16.2307 45.1683 16.8069 45.4306 17.4052 45.9313C18.8214 47.1166 20.0443 49.2869 21.9721 52.8706L27.2561 50.028ZM10.3492 39.8796C8.30552 40.5634 6.95515 40.5235 6.10502 40.2771C5.30589 40.0454 4.67633 39.5552 4.16617 38.7311C3.0353 36.9044 2.64006 33.5974 3.3684 29.7596C4.08315 25.9935 5.7467 22.4619 7.81599 20.3687C8.82813 19.3449 9.83517 18.7647 10.779 18.5447C11.6756 18.3358 12.7354 18.3974 14.0308 19.0403L16.6983 13.6659C14.2558 12.4536 11.7764 12.1516 9.41738 12.7013C7.10563 13.24 5.14063 14.5406 3.5491 16.1505C0.411055 19.3247 -1.65924 24.0718 -2.52638 28.6409C-3.37991 33.1383 -3.20506 38.223 -0.935397 41.8893C0.254714 43.8118 2.03303 45.3435 4.43421 46.0397C6.78439 46.7211 9.42674 46.5152 12.253 45.5695L10.3492 39.8796ZM14.0308 19.0403C23.8251 23.9015 33.5461 21.4435 39.7174 19.4821L37.9 13.764C31.9365 15.6593 24.2403 17.4091 16.6983 13.6659L14.0308 19.0403ZM40.9231 18.7513C47.6151 12.1028 56.8255 8 67 8L67 2C55.1775 2 44.4646 6.77511 36.6943 14.4948L40.9231 18.7513ZM67 8C87.4345 8 104 24.5655 104 45L110 45C110 21.2518 90.7482 2 67 2L67 8ZM104 45C104 65.4345 87.4345 82 67 82L67 88C90.7482 88 110 68.7482 110 45L104 45ZM67 82C51.7356 82 38.6233 72.7559 32.9691 59.5485L27.4533 61.9098C34.0188 77.2459 49.2501 88 67 88L67 82Z" mask="url(#path-1-inside-1_1305_761)"/>
          </g>
          <g className="fill-green-brand">
            <rect x="25.0962" y="17" width="16" height="8" rx="4" />
            <rect x="39.0962" y="29" width="30" height="8" rx="4" />
            <rect x="39.0962" y="41" width="36" height="8" rx="4" />
          </g>
          <g className="fill-blue-brand">
            <path d="M39.0962 57C39.0962 54.7909 40.8871 53 43.0962 53H85.0962V61H43.0962C40.8871 61 39.0962 59.2091 39.0962 57Z" />
            <rect x="85.0962" y="17" width="2" height="57" />
            <path d="M90.0962 0H82.0962V11L86.0962 15L90.0962 11V0Z" />
          </g>
        </svg>
      </div>
      ),
  },
  {
    title: "I'm New",
    description:
      "Start with the tutorial. It will quickly introduce you to the primary features of React Router: from configuring routes, to loading and mutating data, to pending and optimistic UI.",
    slug: "start/tutorial",
    className: "text-red-brand",
    // prettier-ignore
    svg: (
      <div className="absolute top-[-30px] md:top-[-35px] right-[-8px]">
        <svg width="98" height="86" viewBox="0 0 98 86" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="path-1-inside-1_1306_720" fill="white">
            <path fillRule="evenodd" clipRule="evenodd" d="M18.3831 66.0549C16.5182 65.3021 14.9214 64.7619 13.6567 64.5346C-1.37875 61.8331 -3.32992 41.7309 6.09364 38.3121C11.5775 36.3226 14.296 33.0663 16.5098 29.591C22.7739 15.6826 36.7562 6 53 6C75.0914 6 93 23.9086 93 46C93 68.0914 75.0914 86 53 86C38.217 86 25.3071 77.9806 18.3831 66.0549Z"/>
          </mask>
          <g className="fill-gray-50 dark:fill-gray-800 group-hover:fill-gray-100 dark:group-hover:fill-gray-700">
            <path fillRule="evenodd" clipRule="evenodd" d="M18.3831 66.0549C16.5182 65.3021 14.9214 64.7619 13.6567 64.5346C-1.37875 61.8331 -3.32992 41.7309 6.09364 38.3121C11.5775 36.3226 14.296 33.0663 16.5098 29.591C22.7739 15.6826 36.7562 6 53 6C75.0914 6 93 23.9086 93 46C93 68.0914 75.0914 86 53 86C38.217 86 25.3071 77.9806 18.3831 66.0549Z" />
            <path d="M18.3831 66.0549L20.9775 64.5486L20.4606 63.6583L19.506 63.273L18.3831 66.0549ZM13.6567 64.5346L13.1261 67.4874L13.1261 67.4874L13.6567 64.5346ZM6.09364 38.3121L5.07051 35.4919L5.07051 35.4919L6.09364 38.3121ZM16.5098 29.591L19.0401 31.2027L19.1563 31.0202L19.2452 30.8229L16.5098 29.591ZM53 86L53 83L53 83L53 86ZM19.506 63.273C17.5991 62.5032 15.7679 61.8659 14.1872 61.5819L13.1261 67.4874C14.0749 67.6578 15.4373 68.101 17.2602 68.8368L19.506 63.273ZM14.1872 61.5819C8.10568 60.4892 4.63446 55.9225 3.6417 51.0888C2.57958 45.9173 4.48147 42.0883 7.11676 41.1322L5.07051 35.4919C-1.71775 37.9546 -3.55205 45.8861 -2.23562 52.2959C-0.84983 59.0433 4.17225 65.8785 13.1261 67.4874L14.1872 61.5819ZM7.11676 41.1322C13.451 38.8342 16.6284 34.9887 19.0401 31.2027L13.9796 27.9792C11.9636 31.144 9.70389 33.811 5.07051 35.4919L7.11676 41.1322ZM19.2452 30.8229C25.0424 17.9511 37.9791 9 53 9L53 3C35.5333 3 20.5054 13.414 13.7744 28.359L19.2452 30.8229ZM53 9C73.4345 9 90 25.5655 90 46L96 46C96 22.2518 76.7483 3 53 3L53 9ZM90 46C90 66.4345 73.4345 83 53 83L53 89C76.7482 89 96 69.7482 96 46L90 46ZM53 83C39.3295 83 27.3867 75.5877 20.9775 64.5486L15.7887 67.5612C23.2274 80.3735 37.1045 89 53 89L53 83Z" mask="url(#path-1-inside-1_1306_720)"/>
          </g>
          <path className="fill-red-brand" d="M80.5338 19.9063C78.028 19.966 75.5129 20.5016 73.0537 21.0556C69.2522 21.9128 67.2949 20.9682 65.3936 17.457C64.3314 15.4973 63.1062 13.5309 61.573 11.9508C58.6445 8.93976 54.1325 8.69071 50.4736 10.9794C47.3849 12.913 45.7598 17.2661 46.8038 20.8006C47.9955 24.8363 51.4035 27.4564 55.6531 27.3023C57.6724 27.2302 59.7107 26.842 61.6682 26.3269C65.2572 25.3797 66.7896 26.0357 68.294 27.3288C69.2424 28.144 70.1672 28.9507 71.2152 31.9944C72.2633 35.0382 72.0275 36.2445 71.7857 37.4695C71.395 39.4109 70.5914 40.8713 67.1813 42.3382C65.3217 43.1375 63.4728 44.0878 61.8409 45.2729C58.3985 47.7715 57.3249 51.9306 58.8703 55.8445C60.2238 59.2724 64.1844 61.7023 67.8087 61.3243C72.1023 60.879 75.5032 57.9011 75.9571 53.7254C76.1962 51.535 75.9473 49.2325 75.5778 47.0342C74.9181 43.0956 75.8789 41.1461 79.3985 39.4825C81.6775 38.405 83.9879 37.2749 86.0005 35.783C89.0561 33.5137 89.9982 29.5589 88.757 25.9543C87.5158 22.3497 84.34 19.817 80.5338 19.9063Z"/>
          <g className="fill-black dark:fill-white">
            <path d="M45.5 49.6455C41.3694 49.6455 38 46.2761 38 42.1455C38 38.0149 41.3694 34.6455 45.5 34.6455C49.6306 34.6455 53 38.0149 53 42.1455C53 46.2728 49.6273 49.6455 45.5 49.6455Z" />
            <path d="M27.5 39.6455C25.5724 39.6455 24 38.0731 24 36.1455C24 34.2179 25.5724 32.6455 27.5 32.6455C29.4276 32.6455 31 34.2179 31 36.1455C31 38.0716 29.4261 39.6455 27.5 39.6455Z" />
            <path d="M34.5 66.6455C32.5724 66.6455 31 65.0731 31 63.1455C31 61.2179 32.5724 59.6455 34.5 59.6455C36.4276 59.6455 38 61.2179 38 63.1455C38 65.0716 36.4261 66.6455 34.5 66.6455Z" />
          </g>
        </svg>
      </div>
    ),
  },
  {
    title: "I'm on v5",
    description:
      "The migration guide will help you migrate incrementally and keep shipping along the way. Or, do it all in one yolo commit! Either way, we've got you covered to start using the new features right away.",
    slug: "upgrading/v5",
    className: "text-pink-brand",
    // prettier-ignore
    svg: (
      <div className="absolute top-[-30px] md:top-[-35px] right-[-7px]">
        <svg width="96" height="86" viewBox="0 0 96 86" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="path-1-inside-1_1306_721" fill="white">
            <path fillRule="evenodd" clipRule="evenodd" d="M92 40C92 17.9086 74.0914 -3.97289e-06 52 -3.00725e-06C29.9086 -2.0416e-06 12 17.9086 12 40C12 62.0914 29.9086 80 52 80C54.8895 80 57.7074 79.6936 60.423 79.1116C61.387 79.6096 62.2571 80.1735 63.0089 80.8181C70.6942 87.4079 88.5086 90.3181 88.5088 73.3181C88.5088 71.0784 89.0138 68.3515 89.5957 65.2091C90.5044 60.3024 91.6006 54.3827 91.2551 47.7229C91.7439 45.2241 92 42.642 92 40Z"/>
          </mask>
          <g className="fill-gray-50 dark:fill-gray-800 group-hover:fill-gray-100 dark:group-hover:fill-gray-700">
            <path fillRule="evenodd" clipRule="evenodd" d="M92 40C92 17.9086 74.0914 -3.97289e-06 52 -3.00725e-06C29.9086 -2.0416e-06 12 17.9086 12 40C12 62.0914 29.9086 80 52 80C54.8895 80 57.7074 79.6936 60.423 79.1116C61.387 79.6096 62.2571 80.1735 63.0089 80.8181C70.6942 87.4079 88.5086 90.3181 88.5088 73.3181C88.5088 71.0784 89.0138 68.3515 89.5957 65.2091C90.5044 60.3024 91.6006 54.3827 91.2551 47.7229C91.7439 45.2241 92 42.642 92 40Z" />
            <path d="M60.423 79.1116L61.8001 76.4463L60.8452 75.953L59.7943 76.1782L60.423 79.1116ZM63.0089 80.8181L64.9617 78.5407L64.9617 78.5407L63.0089 80.8181ZM88.5088 73.3181L85.5088 73.3181L85.5088 73.3181L88.5088 73.3181ZM89.5957 65.2091L86.6459 64.6628L86.6459 64.6628L89.5957 65.2091ZM91.2551 47.7229L88.3109 47.147L88.24 47.5095L88.2591 47.8784L91.2551 47.7229ZM52 3C72.4345 3 89 19.5655 89 40L95 40C95 16.2518 75.7482 -3 52 -3L52 3ZM15 40C15 19.5655 31.5655 3 52 3L52 -3C28.2518 -3 9 16.2518 9 40L15 40ZM52 77C31.5655 77 15 60.4345 15 40L9 40C9 63.7482 28.2518 83 52 83L52 77ZM59.7943 76.1782C57.284 76.7162 54.6768 77 52 77L52 83C55.1021 83 58.1307 82.671 61.0517 82.045L59.7943 76.1782ZM64.9617 78.5407C64 77.7161 62.9268 77.0284 61.8001 76.4463L59.046 81.7769C59.8472 82.1908 60.5143 82.6309 61.0561 83.0956L64.9617 78.5407ZM85.5088 73.3181C85.5087 77.0469 84.5396 79.2711 83.3625 80.596C82.1839 81.9224 80.4814 82.7025 78.3246 82.931C73.8395 83.4063 68.2648 81.373 64.9617 78.5407L61.0561 83.0956C65.4383 86.8531 72.6135 89.5698 78.9569 88.8976C82.2144 88.5524 85.4459 87.2844 87.8477 84.5812C90.251 81.8764 91.5087 78.0893 91.5088 73.3182L85.5088 73.3181ZM86.6459 64.6628C86.082 67.7076 85.5088 70.7416 85.5088 73.3181L91.5088 73.3182C91.5088 71.4152 91.9456 68.9954 92.5456 65.7553L86.6459 64.6628ZM88.2591 47.8784C88.5841 54.1412 87.5578 59.7387 86.6459 64.6628L92.5456 65.7553C93.451 60.866 94.6172 54.6241 94.251 47.5675L88.2591 47.8784ZM89 40C89 42.4476 88.7627 44.8369 88.3109 47.147L94.1993 48.2988C94.725 45.6113 95 42.8363 95 40L89 40Z" mask="url(#path-1-inside-1_1306_721)"/>
          </g>
          <g className="fill-gray-500 dark:fill-gray-100">
            <path d="M8 19.6455H6.02786L0 34.6455H1.97214L8 19.6455Z" />
            <path d="M8 38.6455H6.02786L0 53.6455H1.97214L8 38.6455Z" />
            <path d="M70 38.6455H68.0279L62 53.6455H63.9721L70 38.6455Z" />
            <rect x="10" y="42" width="51" height="8" rx="4" />
          </g>
          <g className="fill-pink-brand">
            <rect x="10" y="24" width="51" height="8" rx="4"/>
            <rect x="74" y="42" width="22" height="8" rx="4"/>
          </g>
        </svg>
      </div>
    ),
  },
  {
    title: "I'm Stuck!",
    description:
      "Running into a problem? Chances are you're not the first! Explore common questions about React Router v6.",
    slug: "start/faq",
    className: "text-yellow-600 dark:text-yellow-brand",
    // prettier-ignore
    svg: (
      <div className="absolute top-[-30px] md:top-[-35px] right-[-16px]">
        <svg width="96" height="81" viewBox="0 0 96 81" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-gray-50 dark:fill-gray-800 group-hover:fill-gray-100 dark:group-hover:fill-gray-700" fillRule="evenodd" clipRule="evenodd" d="M65.7841 8.89933C58.9684 3.50924 50.3558 0.291502 40.9917 0.291502C18.9003 0.291503 0.991697 18.2001 0.991697 40.2915C0.991698 62.3829 18.9003 80.2915 40.9917 80.2915C52.8792 80.2915 63.5556 75.1059 70.8821 66.8734C74.2015 65.9378 76.7373 66.4596 77.6437 70.1153C80.3926 81.2027 108.358 77.3893 89.4701 51.5577C83.761 43.7498 82.6847 37.5855 81.7077 31.9893C80.3411 24.162 79.1685 17.4462 65.7841 8.89933Z" />
          <path className="fill-yellow-500 dark:fill-yellow-brand" d="M63.5979 63.6262C63.7423 61.796 64.9691 60.405 67.2784 58.648C71.3918 55.5732 75 52.2056 75 46.2025C75 38.2959 68.7217 32 57.6804 32C47.2165 32 40 38.4424 40 48.3255C40 49.7165 40.2887 51.1807 40.5773 52.6449L52.5567 53.0109C52.268 52.0592 52.0515 50.9611 52.0515 49.2041C52.0515 45.4704 53.4948 42.5421 57.6082 42.5421C60.6392 42.5421 62.1546 44.5187 62.1546 46.8614C62.1546 50.1558 59.9175 51.9128 57.0309 54.2555C53.8557 56.8178 52.4124 60.1122 52.268 63.6262H63.5979ZM51.6907 79H64.1031V66.4081H51.6907V79Z" />
          <g className="fill-gray-200 dark:fill-gray-500">
            <path d="M24.8103 37.8224C24.8887 36.8489 25.5546 36.109 26.8082 35.1745C29.0412 33.5389 31 31.7477 31 28.5545C31 24.3489 27.5918 21 21.5979 21C15.9175 21 12 24.4268 12 29.6838C12 30.4237 12.1567 31.2025 12.3134 31.9813L18.8165 32.176C18.6598 31.6698 18.5423 31.0857 18.5423 30.1511C18.5423 28.1651 19.3258 26.6075 21.5588 26.6075C23.2041 26.6075 24.0268 27.6589 24.0268 28.905C24.0268 30.6573 22.8124 31.5919 21.2454 32.838C19.5216 34.2009 18.7381 35.9533 18.6598 37.8224H24.8103ZM18.3464 46H25.0845V39.3022H18.3464V46Z" />
            <path d="M49.2351 8.56075C49.1814 9.22274 48.7258 9.72586 47.868 10.3614C46.3402 11.4735 45 12.6916 45 14.8629C45 17.7227 47.332 20 51.433 20C55.3196 20 58 17.6698 58 14.095C58 13.5919 57.8928 13.0623 57.7856 12.5327L53.3361 12.4003C53.4433 12.7445 53.5237 13.1417 53.5237 13.7773C53.5237 15.1277 52.9876 16.1869 51.4598 16.1869C50.334 16.1869 49.7711 15.472 49.7711 14.6246C49.7711 13.433 50.6021 12.7975 51.6742 11.9502C52.8536 11.0234 53.3897 9.83178 53.4433 8.56075L49.2351 8.56075ZM53.6577 3L49.0474 3L49.0474 7.55452L53.6577 7.55452L53.6577 3Z" />
          </g>
        </svg>
      </div>
    ),
  },
];

export default function Index() {
  // If we're not on 6.4 then we're not on a version where we expect the
  // custom index page, so we'll serve the doc index markdown file instead
  let loaderData = useLoaderData<typeof loader>();
  if ("is6dot4" in loaderData && !loaderData.is6dot4) return <DocPage />;

  let stats = "stats" in loaderData ? loaderData.stats : [];

  return (
    <div className="px-4 pb-4 pt-8 lg:mr-4 xl:pl-0">
      <div className="my-4 grid max-w-[60ch] gap-y-10 md:max-w-none md:grid-cols-2 md:grid-rows-2 md:gap-x-8 md:gap-y-12">
        {mainLinks.map(({ title, description, slug, className, svg }) => (
          <Link
            key={slug}
            to={slug}
            className="group relative flex flex-col gap-1 rounded-lg border-[3px] border-gray-50 p-4 pt-6 hover:border-gray-100 dark:border-gray-800 hover:dark:border-gray-600 md:p-6"
          >
            <h2
              className={classNames(
                className,
                "text-2xl font-bold tracking-tight group-hover:underline"
              )}
            >
              {title}
            </h2>
            <p>{description}</p>
            {svg}
          </Link>
        ))}
      </div>
      {stats && (
        <ul className="mt-8 grid grid-cols-1 gap-y-4 md:grid md:grid-cols-2">
          {stats.map(({ svgId, count, label }: Stats) => (
            <li key={svgId} className="flex gap-4">
              <svg
                aria-label="TODO GitHub Octocat logo"
                className="mt-1 h-8 w-8 text-gray-200 dark:text-gray-600"
              >
                <use href={`${iconsHref}#${svgId}`} />
              </svg>
              <p className="flex flex-col">
                <span className="text-3xl font-light tracking-tight">
                  {count?.toLocaleString("en-US")}
                </span>
                <span className="text-gray-300 dark:text-gray-500">
                  {label}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
