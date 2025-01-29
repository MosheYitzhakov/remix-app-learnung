import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import type { IEntry } from "~/types/entry";

export default function EntryForm({ entry }: { entry?: IEntry }) {
  const fetcher = useFetcher();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const isSaving = entry
    ? fetcher.state !== "idle"
    : fetcher.state === "submitting";
  useEffect(() => {
    if (
      fetcher.type !== "init" &&
      fetcher.state === "submitting" &&
      textRef.current
    ) {
      textRef.current.value = "";
      textRef.current.focus();
    }
  }, [fetcher.state, fetcher.type]);

  return (
    <div className="my-8 border p-3 ">
      <p className="italic">
        {entry?.id ? `Editing entry ${entry.id}` : `Create a new entry`}
      </p>
      <fetcher.Form method="post">
        <fieldset className="disabled:opacity-70" disabled={isSaving}>
          <div>
            <div className="mt-4">
              <input
                type="date"
                name="date"
                required
                className="text-gray-900"
                defaultValue={entry?.date || format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="mt-2 space-x-6">
              <label>
                <input
                  className="mr-1"
                  required
                  type="radio"
                  name="type"
                  value="work"
                  defaultChecked={!entry || entry?.type === "work"}
                />
                Work
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="type"
                  value="learning"
                  defaultChecked={entry?.type === "learning"}
                />
                Learning
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="type"
                  value="interesting-thing"
                  defaultChecked={entry?.type === "interesting-thing"}
                />
                Interesting thing
              </label>
            </div>

            <div className="mt-2">
              <textarea
                ref={textRef}
                name="text"
                required
                className="w-full text-gray-700"
                placeholder="Write your entry..."
                defaultValue={entry?.text}
              />
            </div>

            <div className="mt-1 text-right">
              <button
                className="bg-blue-500 px-4 py-1 font-medium text-white"
                type="submit"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </fieldset>
      </fetcher.Form>
    </div>
  );
}
