import * as Kobalte from "@kobalte/core";
import { HiSolidCheck } from "solid-icons/hi";

import "./styles.css";

export type CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox(props: CheckboxProps) {
  return (
    <Kobalte.Checkbox.Root
      class="Checkbox"
      checked={props.checked}
      onChange={(checked) => props.onChange(checked)}
    >
      <Kobalte.Checkbox.Input class="Checkbox__input" />
      <Kobalte.Checkbox.Control class="Checkbox__control">
        <Kobalte.Checkbox.Indicator>
          <HiSolidCheck />
        </Kobalte.Checkbox.Indicator>
      </Kobalte.Checkbox.Control>
      <Kobalte.Checkbox.Label class="Checkbox__label">
        enabled
      </Kobalte.Checkbox.Label>
    </Kobalte.Checkbox.Root>
  );
}
