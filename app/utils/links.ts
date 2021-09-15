export function isExternalUrl(str: string) {
  return /^((https?:|s?ftp:|file:\/|chrome:)?\/\/|mailto:|tel:)/.test(
    str.toLowerCase()
  );
}
