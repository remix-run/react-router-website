import * as React from "react";
import { useCatch, useLoaderData } from "remix";
import cx from "clsx";

import { useDelegatedReactRouterLinks } from "~/hooks/delegate-links";
import type { Doc as PrismaDoc } from "@prisma/client";

export let meta = ({ data: doc }: { data?: PrismaDoc }) => {
  if (!doc) {
    return { title: "Not Found" };
  }

  return {
    title: "React Router | " + doc.title,
    description: doc.description,
  };
};

const DocsPage: React.VFC = () => {
  let doc = useLoaderData<PrismaDoc>();
  let ref = React.useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(ref);

  return (
    <React.Fragment>
      <div
        ref={ref}
        className={cx("markdown", {
          "has-toc": doc.toc,
        })}
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </React.Fragment>
  );
};

// TODO: Revisit this
// export function CatchBoundary() {
//     let caught = useCatch();
//     return (
//       <div>
//         <h1>{caught.status}</h1>
//         <h2>
//           <code>{caught.statusText}</code>
//         </h2>
//       </div>
//     );
//   }

export { DocsPage };
