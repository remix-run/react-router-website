import type {
  RegisterSearchBoxProps,
  RegisterSearchButtonProps,
} from "@orama/searchbox";
import "@orama/searchbox/dist/index.css";

export const SearchBoxParams: RegisterSearchBoxProps = {
  cloudConfig: {
    // The search endpoint for the Orama index
    url: "https://cloud.orama.run/v1/indexes/react-router-dev-nwm58f",
    // The public API key for performing search. This is commit-safe.
    key: "23DOEM1uyLIqnumsPZICJzw2Xn7GSFkj"
  },
  colorScheme: "dark",
  theme: "secondary",
  resultsMap: {
    description: "content",
  },
  facetProperty: "section",
  searchParams: {
    threshold: 0,
  },
  searchMode: 'hybrid',
  backdrop: true,
  themeConfig: {
    light: {},
    dark: {
      "--backdrop-bg-color": "#29282ee6",
    },
  },
};

export const SearchButtonParams: RegisterSearchButtonProps = {
  colorScheme: "dark",
  fullWidth: true,
  className:
    "bg-gray-50 hover:bg-gray-100 border-transparent dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-transparent mb-3 -mx-2 rounded-full",
};
