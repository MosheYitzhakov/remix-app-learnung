import { PrismaClient } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";

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
  };
}
export default function EditPage() {
  const entry = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Editing entry {entry.id}</p>
      <p>Date: {entry.date}</p>
      <p>Type: {entry.type}</p>
      <p>Text: {entry.text}</p>
    </div>
  );
}
