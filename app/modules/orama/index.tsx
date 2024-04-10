import { OramaClient } from "@oramacloud/client";
import "@orama/searchbox/dist/index.css";

const oramaInstance = new OramaClient({
  // The search endpoint for the Orama index
  endpoint: "https://cloud.orama.run/v1/indexes/react-router-dev-nwm58f",
  // The public API key for performing search. This is commit-safe.
  api_key: "23DOEM1uyLIqnumsPZICJzw2Xn7GSFkj",
});

export const SearchBoxParams = {
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
  backdrop: true,
};

export const SearchButtonParams = {
  colorScheme: "dark",
  fullWidth: true,
  className:
    "bg-gray-50 hover:bg-gray-100 border-transparent dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-transparent mb-3 -mx-2",
};
