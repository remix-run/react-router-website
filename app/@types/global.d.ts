declare namespace NodeJS {
  interface ProcessEnv {
    readonly FLY_APP_NAME: string;
    readonly AUTH_TOKEN: string | undefined;
    readonly DATABASE_URL: string | undefined;
    readonly LOCAL_DOCS_PATH: string | undefined;
    readonly REPO: string | undefined;
    readonly REPO_DOCS_PATH: string | undefined;
    readonly REPO_LATEST_BRANCH: string | undefined;
    readonly CONVERTKIT_KEY: string | undefined;
    readonly SITE_URL: string | undefined;
  }
}
