import { DocSearchModal } from "@docsearch/react";

export default function SearchModal({
  initialScrollY,
  onClose,
  docSearchVersion,
}: {
  initialScrollY: number;
  onClose: () => void;
  docSearchVersion?: string;
}) {
  return (
    <DocSearchModal
      appId="RB6LOUCOL0"
      indexName="reactrouter"
      apiKey="b50c5d7d9f4610c9785fa945fdc97476"
      initialScrollY={initialScrollY}
      onClose={onClose}
      // The version facet must also be enabled in the Algolia index settings.
      searchParameters={
        docSearchVersion
          ? { facetFilters: [`version:${docSearchVersion}`] }
          : undefined
      }
    />
  );
}
