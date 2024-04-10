import { OramaClient } from "@oramacloud/client";
import {
  RegisterSearchBox,
  RegisterSearchButton,
} from "@orama/searchbox/dist/index";
import "@orama/searchbox/dist/index.css";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "orama-search-button": JSX.HTMLAttributes<CustomElement>;
      "orama-searchbox": JSX.HTMLAttributes<CustomElement>;
    }
  }
}

const oramaInstance = new OramaClient({
  // The search endpoint for the Orama index
  endpoint: "https://cloud.orama.run/v1/indexes/react-router-dev-nwm58f",
  // The public API key for performing search. This is commit-safe.
  api_key: "23DOEM1uyLIqnumsPZICJzw2Xn7GSFkj",
});

if (typeof window !== "undefined") {
  RegisterSearchBox({
    oramaInstance,
    colorScheme: "dark",
    resultsMap: {
      description: "content",
    },
    // The public API key for summary generation. This is commit-safe.
    summaryGeneration: "vht9ve9d-Rz0HcnWsxY+9icY$a_HkwPb",
    facetProperty: "category",
    searchParams: {
      threshold: 0,
    },
  });

  RegisterSearchButton({
    colorScheme: "dark",
  });
}
