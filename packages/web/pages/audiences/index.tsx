import type { Audience } from "@feature-flag-service/common";
import { createResource, For, Suspense } from "solid-js";

import { AudienceRow } from "../../components/audience";
import { Loader } from "../../components/loader";

export default function AudiencesPage() {
  async function fetchData(): Promise<Audience[]> {
    const res = await fetch("/api/audiences", {
      headers: {
        Authorization: "Bearer secret",
      },
    });

    return res.json();
  }

  const [audiences] = createResource<Audience[]>(fetchData);

  return (
    <div class="Page">
      <Suspense fallback={<Loader />}>
        <For each={audiences()}>
          {(item) => <AudienceRow audience={item} />}
        </For>
      </Suspense>
    </div>
  );
}
