declare namespace NodeJS {
  interface ProcessEnv {
    FLY_APP_NAME: string;
    AUTH_TOKEN: string;
    DATABASE_URL: string;
    LOCAL_DOCS_PATH: string;
    REPO: string;
    REPO_DOCS_PATH: string;
    REPO_LATEST_BRANCH: string;
    CONVERTKIT_KEY: string;
  }
}