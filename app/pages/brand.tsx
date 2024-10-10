import type { MetaFunction } from "@remix-run/node";
import classNames from "classnames";

export const meta: MetaFunction = () => {
  return [{ title: "React Router Assets and Branding Guidelines" }];
};

const BRAND_DIR = "/_brand/React Router Brand Assets";

export default function Brand() {
  return (
    <div className="prose container my-8 flex max-w-full flex-col gap-8 text-base sm:text-lg lg:my-24 lg:max-w-4xl">
      <h1 className="text-2xl font-extrabold dark:text-gray-200 md:text-5xl">
        React Router Brand
      </h1>
      <p>
        These assets are provided for use in situations like articles and video
        tutorials.
      </p>
      <AssetHeader>Trademark Usage Agreement</AssetHeader>
      <p>The React Router name and logos are trademarks of Shopify Inc.</p>
      <p>
        You may not use the React Router name or logos in any way that could
        mistakenly imply any official connection with or endorsement of Shopify
        Inc. Any use of the React Router name or logos in a manner that could
        cause customer confusion is not permitted.
      </p>
      <p>
        Additionally, you may not use our trademarks for t-shirts, stickers, or
        other merchandise without explicit written consent.
      </p>

      <AssetHeader>Download Assets</AssetHeader>
      <p>
        You can download a zip file containing all the React Router brand
        assets:
      </p>
      <p>
        <a
          href="/_brand/React Router Brand Assets.zip"
          className="underline opacity-50 hover:opacity-100"
          download
        >
          React Router Brand Assets
        </a>
      </p>

      <AssetHeader>Lockup</AssetHeader>
      <AssetSubHeader>Horizontal</AssetSubHeader>
      <div className="grid grid-cols-2 gap-4 gap-x-6">
        <Logos title="Lockup" subTitle="Horizontal" />
        <Logos title="Lockup" subTitle="Horizontal" oneColor />
      </div>
      <AssetSubHeader>Horizontal Stacked</AssetSubHeader>
      <AssetsGrid>
        <Logos title="Lockup" subTitle="Horizontal Stacked" />
        <Logos title="Lockup" subTitle="Horizontal Stacked" oneColor />
      </AssetsGrid>
      <AssetSubHeader>Vertically Stacked</AssetSubHeader>
      <AssetsGrid>
        <Logos title="Lockup" subTitle="Vertically Stacked" />
        <Logos title="Lockup" subTitle="Vertically Stacked" oneColor />
      </AssetsGrid>

      <AssetHeader>Wordmark</AssetHeader>
      <AssetSubHeader>Horizontal</AssetSubHeader>
      <AssetsGrid>
        <Logos title="Wordmark" subTitle="Horizontal" />
      </AssetsGrid>
      <AssetSubHeader>Stacked</AssetSubHeader>
      <AssetsGrid>
        <Logos title="Wordmark" subTitle="Stacked" />
      </AssetsGrid>

      <AssetHeader>Logo</AssetHeader>
      <AssetsGrid>
        <Logos title="Logo" />
        <Logos title="Logo" oneColor />
      </AssetsGrid>
    </div>
  );
}

function AssetHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-extrabold dark:text-gray-200 md:text-3xl">
      {children}
    </h2>
  );
}

function AssetSubHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-extrabold dark:text-gray-200 md:text-2xl">
      {children}
    </h3>
  );
}

function AssetsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 gap-x-6">{children}</div>;
}

/**
 * Creates the dark and light logos for a given asset.
 */
function Logos({
  title,
  subTitle,
  oneColor,
}: {
  title: "Lockup" | "Wordmark" | "Logo";
  subTitle?: string;
  oneColor?: boolean;
}) {
  let filePath = `${BRAND_DIR}/React Router ${title}`;
  if (subTitle) {
    filePath += `/${subTitle}`;
  }
  if (oneColor) {
    filePath += `/One Color`;
  }

  let downloadFilePath = `rr_${title}`;
  if (subTitle) {
    downloadFilePath += `_${subTitle}`;
  }
  downloadFilePath = downloadFilePath.toLocaleLowerCase();

  return (
    <>
      <LogoBox
        filePath={`${filePath}/Light`}
        theme="light"
        downloadFilePath={downloadFilePath + "_light"}
      />
      <LogoBox
        filePath={`${filePath}/Dark`}
        theme="dark"
        downloadFilePath={downloadFilePath + "_dark"}
      />
    </>
  );
}

let background = {
  light:
    "bg-white bg-[linear-gradient(45deg,theme(colors.gray.100)_25%,transparent_25%,transparent_75%,theme(colors.gray.100)_75%,theme(colors.gray.100)),linear-gradient(45deg,theme(colors.gray.100)_25%,transparent_25%,transparent_75%,theme(colors.gray.100)_75%,theme(colors.gray.100))] bg-[length:24px_24px] bg-[position:0_0,12px_12px]",
  dark: "bg-black bg-[linear-gradient(45deg,theme(colors.gray.800)_25%,transparent_25%,transparent_75%,theme(colors.gray.800)_75%,theme(colors.gray.800)),linear-gradient(45deg,theme(colors.gray.800)_25%,transparent_25%,transparent_75%,theme(colors.gray.800)_75%,theme(colors.gray.800))] bg-[length:24px_24px] bg-[position:0_0,12px_12px]",
};

function LogoBox({
  filePath,
  theme,
  downloadFilePath,
}: {
  filePath: string;
  theme: "dark" | "light";
  downloadFilePath: string;
}) {
  // replace / with - for the alt text
  const alt = filePath.replace(/\//g, " - ");

  return (
    <div className="flex flex-col">
      <div
        className={classNames(
          `flex aspect-[16/9] items-center justify-center rounded-md`,
          background[theme]
        )}
      >
        <img
          className="max-h-[33%] max-w-[50%]"
          src={`${filePath}.svg`}
          alt={alt}
        />
      </div>
      <div className="mt-1 flex items-end gap-4 text-sm">
        {["svg", "png"].map((format) => (
          <a
            className="uppercase underline opacity-50 hover:opacity-100"
            href={`${filePath}.${format}`}
            download={`${downloadFilePath}.${format}`}
            key={format}
          >
            {format}
          </a>
        ))}
      </div>
    </div>
  );
}
