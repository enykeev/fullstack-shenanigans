import { MountableElement, render } from "solid-js/web";

import "./styles.css";

function HelloWorld() {
  return <div class="some">Nyako!</div>;
}

render(
  () => <HelloWorld />,
  document.getElementById("root") as MountableElement,
);
