import {
  redirect,
  type ActionArgs,
  type LinksFunction,
  type LoaderArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";
import { destroySession, getSession } from "./session";
import { handleSubmit } from "./routes";
export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
export async function loader({ request }: LoaderArgs) {
  let session = await getSession(request.headers.get("cookie"));
  return session.data;
}
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const session = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl">Work Journal</h1>
              <p className="mt-2 text-lg text-gray-400">
                Learnings and doings. Updated weekly.
              </p>
            </div>
            {session?.isAdmin ? (
              <Form onSubmit={handleSubmit} method="post">
                <button className="rounded-lg px-3 py-2 font-medium text-blue-500">
                  Logout {"->"}
                </button>
              </Form>
            ) : (
              <Link to="/login" className="px-3 py-2 font-medium text-blue-500">
                Login {"->"}
              </Link>
            )}
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
