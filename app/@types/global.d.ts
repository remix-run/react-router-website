declare namespace NodeJS {
  interface ProcessEnv {
    readonly FLY_APP_NAME: string;
    readonly AUTH_TOKEN: string;
    readonly DATABASE_URL: string;
    readonly LOCAL_DOCS_PATH: string;
    readonly REPO: string;
    readonly REPO_DOCS_PATH: string;
    readonly REPO_LATEST_BRANCH: string;
    readonly CONVERTKIT_KEY: string;
    readonly SITE_URL: string;
  }
}
