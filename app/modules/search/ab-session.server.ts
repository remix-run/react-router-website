import { createCookieSessionStorage } from "@remix-run/node";

export let unencryptedSession = createCookieSessionStorage({
  cookie: {
    name: "ab_session",
    path: "/",
    sameSite: "lax",
  },
});

const SESSION_KEY = "ab-docsearch-bucket";

export async function bucketUser(request: Request) {
  let session = await unencryptedSession.getSession(
    request.headers.get("Cookie")
  );

  let { searchParams } = new URL(request.url);
  let searchParamBucket = searchParams.get("bucket");

  let sessionBucket = session.get(SESSION_KEY);

  // if there is already a cookie and it's not being overridden, go ahead and return it
  if (isBucketValue(sessionBucket) && !searchParamBucket) {
    return {
      bucket: sessionBucket,
    };
  }

  let bucket = isBucketValue(searchParamBucket)
    ? searchParamBucket
    : randomBucket();

  session.set(SESSION_KEY, bucket);

  return {
    bucket,
    headers: {
      "Set-Cookie": await unencryptedSession.commitSession(session, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
      }),
    },
  };
}

function isBucketValue(bucket: any): bucket is "docsearch" | "orama" {
  return bucket === "docsearch" || bucket === "orama";
}

const randomBucket = () => (Math.random() > 0.1 ? "orama" : "docsearch");
