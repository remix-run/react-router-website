import { Header } from "../docs-header/docs-header";
import { fakeMenu } from "./fake-menu";

export async function loader() {
  return {
    menu: fakeMenu,
    header: {
      branches: ["main", "dev", "local"],
      currentGitHubRef: "main",
      isLatest: true,
      latestVersion: "7.0.1",
      releaseBranch: "main",
      versions: ["6.26.1", "7.0.0"],
      lang: "en",
    },
  };
}

export default function Playground() {
  return (
    <>
      <Header />
      {/* <Footer /> */}
      {/* <Demo label="DetailsPopup">
        <div className="min-h-28 relative">
          <DetailsPopup className="w-60">
            <div className="p-4">Heyo I'm a popup</div>
          </DetailsPopup>
        </div>
      </Demo>

      <Demo label="PopupLabel">
        <div className="min-h-48 relative">
          <DetailsPopup className="w-60">
            <PopupLabel label="I am a label" />
            <p className="px-6">Stuff below</p>
            <PopupLabel label="Me too!" />
            <p className="px-6">Stuff below</p>
          </DetailsPopup>
        </div>
      </Demo> */}
    </>
  );
}

// function Demo({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="border-b last:border-none p-8">
//       <div className="mb-2 font-bold">{label}</div>
//       {children}
//     </div>
//   );
// }
