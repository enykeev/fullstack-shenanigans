import { For, Suspense, createResource } from "solid-js";
import { FlagRow } from "../../components/flag";
import { Loader } from "../../components/loader";
import { Flag } from "@feature-flag-service/common";

export default function FlagsPage() {
  async function fetchData(): Promise<Flag[]> {
    const res = await fetch("/api/flags", {
      headers: {
        Authorization: "Bearer secret",
      },
    });

    return res.json();
  }

  const [flags] = createResource<Flag[]>(fetchData);

  return (
    <div class="Page">
      <Suspense fallback={<Loader />}>
        <For each={flags()}>{(item) => <FlagRow flag={item} />}</For>
      </Suspense>
    </div>
  );
}
