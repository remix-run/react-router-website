import {
  RouteComponent,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
} from "remix";
import { json } from "remix";
import { prisma } from "~/db.server";

interface RouteData {
  refs: string[];
}

const loader: LoaderFunction = async ({ request }) => {
  const refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
  });

  return json({
    refs: refs.map(({ ref }) => ref),
  });
};

const meta: MetaFunction = () => ({
  title: "Refs!",
});

const RefsPage: RouteComponent = () => {
  const data = useLoaderData<RouteData>();
  return (
    <div>
      <h1>Refs we got</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default RefsPage;
export { loader, meta };
