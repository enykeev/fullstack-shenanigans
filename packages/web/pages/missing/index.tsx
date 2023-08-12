import { HiSolidExclamationTriangle } from "solid-icons/hi";

import "./styles.css";

export default function MissingPage() {
  return (
    <div class="MissingPage">
      <div class="MissingPage__container">
        <div class="MissingPage__icon">
          <HiSolidExclamationTriangle size="64px" />
        </div>
        <div class="MissingPage__title">This page does not exist</div>
        <div class="MissingPage__message">
          We don't know how you got there, but you need to leave or we'll call
          security
        </div>
      </div>
    </div>
  );
}
