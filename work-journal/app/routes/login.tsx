import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/session";
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  let { email, password } = Object.fromEntries(formData);
  if (email === "admin@admin" && password === "admin") {
    let session = await getSession();
    session.set("isAdmin", true);
    return redirect("/", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } else {
    return json({ error: "Invalid login" }, 401);
  }
}
export async function loader({ request }: LoaderArgs) {
  let session = await getSession(request.headers.get("cookie"));

  return session.data;
}
export default function LoginPage() {
  let data = useLoaderData<typeof loader>();
  const actionData = useActionData();
  return (
    <div className="mt-8">
      {data?.isAdmin ? (
        <p>You're logged in!</p>
      ) : (
        <Form method="post">
          <input
            className="text-gray-900"
            type="email"
            name="email"
            placeholder="...email"
            required
          />
          <input
            className="text-gray-900"
            type="password"
            name="password"
            placeholder="...password"
            required
          />
          <button className="bg-blue-500 px-3 py-2 font-medium text-white">
            Log-in
          </button>
        </Form>
      )}
      {actionData?.error && (
        <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
      )}
    </div>
  );
}
