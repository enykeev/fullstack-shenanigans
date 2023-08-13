import { Flag } from "@feature-flag-service/common";
import { Show, createSignal } from "solid-js";
import { HiOutlineClock } from "solid-icons/hi";

import { Checkbox } from "../checkbox";

import "./styles.css";

export function FlagControls({ flag }: { flag: Flag }) {
  const [checked, setChecked] = createSignal(!!flag.value);
  return (
    <div class="FlagControl">
      <div class="FlagControl__control">
        <Checkbox
          checked={checked()}
          onChange={(checked) => setChecked(checked)}
        />
      </div>
      <div class="FlagControl__overrides">
        and <a href="/overrides">5 overrides</a>
      </div>
    </div>
  );
}

export function FlagRow({ flag }: { flag: Flag }) {
  return (
    <div class="FlagRow">
      <div class="FlagRow__title">{flag.name}</div>
      <Show when={flag.description}>
        <div class="FlagRow__description">{flag.description}</div>
      </Show>
      <div class="FlagRow__meta">
        <div class="FlagRow__updatedAt">
          <HiOutlineClock style={{ "margin-bottom": "-.2em" }} /> updated{" "}
          {Temporal.Now.zonedDateTimeISO()
            .since(
              Temporal.Instant.from(flag.updatedAt).toZonedDateTimeISO("utc"),
            )
            .total({ unit: "second" })}{" "}
          seconds ago
        </div>
      </div>
      <div class="FlagRow__controls">
        <FlagControls flag={flag} />
      </div>
    </div>
  );
}
