import type { Audience } from "@feature-flag-service/common";
import { HiOutlineClock } from "solid-icons/hi";
import { Show } from "solid-js";

import "./styles.css";

export function AudienceRow({ audience }: { audience: Audience }) {
  return (
    <div class="AudienceRow">
      <div class="AudienceRow__title">{audience.name}</div>
      <div class="AudienceRow__content">
        <Show when={audience.description}>
          <div class="AudienceRow__description">{audience.description}</div>
        </Show>
        <div class="AudienceRow__filter">{audience.filter}</div>
      </div>
      <div class="AudienceRow__meta">
        <div class="AudienceRow__updatedAt">
          <HiOutlineClock style={{ "margin-bottom": "-.2em" }} /> updated{" "}
          {Temporal.Now.zonedDateTimeISO()
            .since(
              Temporal.Instant.from(audience.updatedAt).toZonedDateTimeISO(
                "utc",
              ),
            )
            .total({ unit: "second" })}{" "}
          seconds ago
        </div>
      </div>
    </div>
  );
}
