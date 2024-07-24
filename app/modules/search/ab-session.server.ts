import { createCookieSessionStorage } from "@remix-run/node";

export let unencryptedSession = createCookieSessionStorage({
  cookie: {
    name: "ab_session",
    path: "/",
    sameSite: "lax",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
  },
});

const SESSION_KEY = "ab-docsearch-bucket";

export async function bucketUser(request: Request) {
  let session = await unencryptedSession.getSession(
    request.headers.get("Cookie")
  );

  let { searchParams } = new URL(request.url);
  let bucket = searchParams.get("bucket");

  // if the bucket isn't being overridden by a query parameter, use the session
  if (!isBucketValue(bucket)) {
    bucket = session.get(SESSION_KEY);
  }

  // if no bucket in the session, assign the user
  if (!isBucketValue(bucket)) {
    bucket = Math.random() > 0.5 ? "orama" : "docsearch";
  }

  let safeBucket = isBucketValue(bucket) ? bucket : "docsearch";

  session.set(SESSION_KEY, safeBucket);

  return {
    bucket: safeBucket,
    headers: {
      "Set-Cookie": await unencryptedSession.commitSession(session),
    },
  };
}

function isBucketValue(bucket: any): bucket is "docsearch" | "orama" {
  return bucket === "docsearch" || bucket === "orama";
}
