import { createEffect, createSignal } from "solid-js";

const [internalPath, setInternalPath] = createSignal();

export function path() {
  return internalPath() || location.pathname;
}

export function navigate(path: string) {
  window.history.pushState({ path }, "", path);
  setInternalPath(path);
}

createEffect((prevPath) => {
  const nextPath = path();

  console.log(
    `Transitioning from ${prevPath || "external resource"} to ${nextPath}`,
  );

  return nextPath;
}, internalPath());

window.addEventListener("popstate", (ev) => {
  const { path } = ev.state || {};
  setInternalPath(path);
});
