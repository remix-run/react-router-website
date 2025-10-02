import { unstable_useRoute as useRoute } from "react-router";
import invariant from "tiny-invariant";

export function useHeaderData() {
  let docsData = useRoute("docs");
  let v6IndexLayoutData = useRoute("v6-index-layout");

  let data = docsData || v6IndexLayoutData;

  invariant(data?.loaderData?.header, "Expected `header` in loader data");
  return data.loaderData.header;
}
