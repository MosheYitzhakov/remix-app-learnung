import { PrismaClient } from "@prisma/client";
import { redirect, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import EntryForm from "~/components/entry-form";
import type { typeEntry } from "~/types/entry";

export async function action({ request, params: { entryId } }: ActionArgs) {
  if (typeof entryId !== "string") {
    throw new Response("Not found", { status: 404 });
  }
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
  await db.entry.update({
    where: {
      id: +entryId,
    },
    data: {
      date: new Date(date),
      type: type,
      text: text,
    },
  });

  return redirect("/");
}
export async function loader({ params: { entryId } }: LoaderArgs) {
  if (typeof entryId !== "string") {
    throw new Response("Not found", { status: 404 });
  }
  let db = new PrismaClient();
  let entry = await db.entry.findUnique({
    where: {
      id: +entryId,
    },
  });

  console.log(entry);
  if (!entry) {
    throw new Response("Not found", { status: 404 });
  }
  return {
    ...entry,
    date: format(entry.date, "yyyy-MM-dd"),
    type: entry.type as typeEntry,
  };
}
export default function EditPage() {
  const entry = useLoaderData<typeof loader>();
  return (
    <div>
      
      <EntryForm entry={entry} />
    </div>
  );
}
