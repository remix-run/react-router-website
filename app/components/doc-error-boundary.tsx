import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";

export function ErrorBoundary() {
  let error = useRouteError();
  let params = useParams();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h1 className="text-9xl font-bold">404</h1>
        <p className="text-lg">
          There is no doc for <i className="text-gray-500">{params["*"]}</i>
        </p>
      </div>
    );
  }

  throw error;
}
