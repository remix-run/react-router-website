export function isExternalUrl(str: string) {
  return /^((https?:|s?ftp:|file:|chrome:)?\/\/|mailto:)/.test(str);
}
