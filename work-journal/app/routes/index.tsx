import { PrismaClient } from "@prisma/client";
import { redirect, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { format, startOfWeek } from "date-fns";
import { type FormEvent } from "react";
import EntryForm from "~/components/entry-form";
import { getSession } from "~/session";

export async function action({ request }: ActionArgs) {
  const db = new PrismaClient();
  const formData = await request.formData();
  let { entryId, _action, date, type, text } = Object.fromEntries(formData);
  if (_action === "delete") {
    await db.entry.delete({
      where: {
        id: +entryId,
      },
    });
  } else {
    if (
      typeof date !== "string" ||
      typeof type !== "string" ||
      typeof text !== "string"
    ) {
      throw new Error("Bad request");
    }
    await db.entry.create({
      data: {
        date: new Date(date),
        type: type,
        text: text,
      },
    });
  }
  return redirect("/");
}
export async function loader({ request }: LoaderArgs) {
  let db = new PrismaClient();
  let entries = await db.entry.findMany();
  const session = await getSession(request.headers.get("cookie"));
  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: format(entry.date, "yyyy-MM-dd"), // '2023-03-28'
    })),
  };
}
export default function Index() {
  const { session, entries } = useLoaderData<typeof loader>();
  let entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      let sundayString = format(startOfWeek(entry.date), "yyyy-MM-dd");
      memo[sundayString] ||= [];
      memo[sundayString].push(entry);
      return memo;
    },
    {}
  );
  let weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning"
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing"
      ),
    }));

  return (
    <div>
      {session.isAdmin && <EntryForm />}
      <div className="mt-6">
        <div className="mt-3 space-y-4">
          {weeks.map((week) => (
            <div key={week.dateString}>
              <p className="font-bold">
                Week of {format(week.dateString, "MMMM d")}
                <sup>th</sup>
              </p>
              <div className="mt-3 ml-5 space-y-4">
                {week.work.length > 0 && (
                  <div>
                    <p>Work</p>
                    <ul className="ml-8 list-disc">
                      {week.work.map((entry) => (
                        <EntryListItem
                          key={entry.id}
                          entry={entry}
                          session={session}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                {week.learnings.length > 0 && (
                  <div>
                    <p>Learning</p>
                    <ul className="ml-8 list-disc">
                      {week.learnings.map((entry) => (
                        <EntryListItem
                          key={entry.id}
                          entry={entry}
                          session={session}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                {week.interestingThings.length > 0 && (
                  <div>
                    <p>Interesting things</p>
                    <ul className="ml-8 list-disc">
                      {week.interestingThings.map((entry) => (
                        <EntryListItem
                          key={entry.id}
                          entry={entry}
                          session={session}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntryListItem({
  entry,
  session,
}: {
  entry: Awaited<ReturnType<typeof loader>>["entries"][number];
  session: Awaited<ReturnType<typeof loader>>["session"];
}) {
  return (
    <li className="group">
      {entry.text}
      {session.isAdmin && (
        <>
          <Link
            to={`/entries/${entry.id}/edit`}
            className="ml-2 text-blue-500 opacity-30 hover:rounded-lg hover:border hover:border-blue-500 hover:p-1 group-hover:opacity-100"
          >
            Edit
          </Link>
          <Form method="post" onSubmit={handleSubmit} className="inline">
            <input type="hidden" name="entryId" value={entry.id} />
            <button
              name="_action"
              value="delete"
              className="ml-2 text-red-500 opacity-30 hover:rounded-lg hover:border hover:border-red-500 hover:p-1 group-hover:opacity-100"
            >
              Delete
            </button>
          </Form>
        </>
      )}
    </li>
  );
}
export function handleSubmit(e: FormEvent<HTMLFormElement>) {
  if (!confirm("Are you sure?")) {
    e.preventDefault();
  }
}
