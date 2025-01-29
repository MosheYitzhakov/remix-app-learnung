import { PrismaClient } from "@prisma/client";
import { redirect, type ActionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format, startOfWeek } from "date-fns";
import { useRef } from "react";
import EntryForm from "~/components/entry-form";

export async function action({ request }: ActionArgs) {
  const db = new PrismaClient();
  const formData = await request.formData();
  let { date, type, text } = Object.fromEntries(formData);

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

  return redirect("/");
}
export async function loader() {
  let db = new PrismaClient();
  let entries = await db.entry.findMany();

  return entries.map((entry) => ({
    ...entry,
    date: format(entry.date, "yyyy-MM-dd"), // '2023-03-28'
  }));
}
export default function Index() {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const entries = useLoaderData<typeof loader>();
  console.log({ entries });
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
  console.log({ weeks });
  console.log(textRef.current);

  return (
    <div>
      <EntryForm />

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
                        <EntryListItem key={entry.id} entry={entry} />
                      ))}
                    </ul>
                  </div>
                )}
                {week.learnings.length > 0 && (
                  <div>
                    <p>Learning</p>
                    <ul className="ml-8 list-disc">
                      {week.learnings.map((entry) => (
                        <EntryListItem key={entry.id} entry={entry} />
                      ))}
                    </ul>
                  </div>
                )}
                {week.interestingThings.length > 0 && (
                  <div>
                    <p>Interesting things</p>
                    <ul className="ml-8 list-disc">
                      {week.interestingThings.map((entry) => (
                        <EntryListItem key={entry.id} entry={entry} />
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
}: {
  entry: Awaited<ReturnType<typeof loader>>[number];
}) {
  return (
    <li className="group">
      {entry.text}
      <Link
        to={`/entries/${entry.id}/edit`}
        className="ml-2 text-blue-500 opacity-30 group-hover:opacity-100"
      >
        Edit
      </Link>
    </li>
  );
}
