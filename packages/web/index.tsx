import { createStore } from "solid-js/store";
import { For, Match, MountableElement, Switch, render } from "solid-js/web";

import { NavItem, Navigation } from "./components/navigation";
import { Logo } from "./components/logo";

import FlagsPage from "./pages/flags";
import SectionsPage from "./pages/sections";
import MissingPage from "./pages/missing";

import "temporal-polyfill/global";

import "./styles.css";

const ROUTES = [
  {
    path: "/flags",
    title: "Flags",
    component: FlagsPage,
  },
  {
    path: "/sections",
    title: "Sections",
    component: SectionsPage,
  },
  {
    path: "/overrides",
    title: "Overrides",
    component: SectionsPage,
  },
];

function Header({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <div class="header">
      <Logo />
      <Navigation>
        <For each={ROUTES}>
          {(item) => (
            <NavItem href={item.path} onClick={() => onNavigate(item.path)}>
              {item.title}
            </NavItem>
          )}
        </For>
      </Navigation>
    </div>
  );
}

function App() {
  const [state, setState] = createStore({ route: "/flags" });
  return (
    <div class="app">
      <Header onNavigate={(route: string) => setState("route", route)} />
      <Switch fallback={<MissingPage />}>
        <Match when={state.route === "/"}>
          <div>Main page</div>
        </Match>
        <For each={ROUTES}>
          {(item) => (
            <Match when={state.route === item.path}>
              <item.component />
            </Match>
          )}
        </For>
      </Switch>
    </div>
  );
}

render(() => <App />, document.getElementById("root") as MountableElement);
