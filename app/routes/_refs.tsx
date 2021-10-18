import { Prisma } from "@prisma/client";
import {
  RouteComponent,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
  Link,
} from "remix";
import { json } from "remix";
import { prisma } from "~/db.server";

const refs = Prisma.validator<Prisma.GitHubRefArgs>()({
  select: {
    ref: true,
    createdAt: true,
    updatedAt: true,
  },
});

type Ref = Prisma.GitHubRefGetPayload<typeof refs>;

interface RouteData {
  refs: (Ref & { versionOrBranch: string })[];
}

const loader: LoaderFunction = async () => {
  const refs = await prisma.gitHubRef.findMany({
    select: {
      ref: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return json({
    refs: refs.map((ref) => ({
      ...ref,
      versionOrBranch: ref.ref.replace(/^refs\/(heads|tags)\//, ""),
    })),
  });
};

const meta: MetaFunction = () => ({
  title: "Refs!",
});

const RefsPage: RouteComponent = () => {
  const data = useLoaderData<RouteData>();
  return (
    <div className="px-6">
      <h1>Refs we got</h1>
      <ul className="space-y-10">
        {data.refs.map((ref) => (
          <li key={ref.ref}>
            <div>
              <Link to={`/docs/en/${ref.versionOrBranch}`}>{ref.ref}</Link>
              <p>createdAt: {ref.createdAt}</p>
              <p>updatedAt: {ref.updatedAt}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RefsPage;
export { loader, meta };
