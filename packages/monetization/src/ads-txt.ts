/**
 * Dynamic /ads.txt Builder
 */

export interface AdsTxtEntry {
  domain: string;
  publisherId: string;
  accountType: "DIRECT" | "RESELLER";
  certificationAuthorityId?: string;
}

export function generateAdsTxt(entries: AdsTxtEntry[]): string {
  const defaultEntries: AdsTxtEntry[] = [
    {
      domain: "google.com",
      publisherId: "pub-0000000000000000",
      accountType: "DIRECT",
      certificationAuthorityId: "f08c47fec0942fa0",
    },
  ];

  const allEntries = entries.length > 0 ? entries : defaultEntries;

  return allEntries
    .map(
      (e) =>
        `${e.domain}, ${e.publisherId}, ${e.accountType}${e.certificationAuthorityId ? `, ${e.certificationAuthorityId}` : ""}`,
    )
    .join("\n");
}
