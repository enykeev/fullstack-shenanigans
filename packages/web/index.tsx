import "temporal-polyfill/global";

import { For, Match, MountableElement, render, Switch } from "solid-js/web";

import { Logo } from "./components/logo";
import { Navigation, NavItem } from "./components/navigation";
import { navigate, path } from "./components/navigation/state";
import AudiencesPage from "./pages/audiences";
import FlagsPage from "./pages/flags";
import MissingPage from "./pages/missing";
import OverridesPage from "./pages/overrides";

import "./styles.css";

const ROUTES = [
  {
    path: "/flags",
    title: "Flags",
    component: FlagsPage,
  },
  {
    path: "/audiences",
    title: "Audiences",
    component: AudiencesPage,
  },
  {
    path: "/overrides",
    title: "Overrides",
    component: OverridesPage,
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
  return (
    <div class="app">
      <Header onNavigate={(route: string) => navigate(route)} />
      <Switch fallback={<MissingPage />}>
        <Match when={path() === "/"}>
          <div>Main page</div>
        </Match>
        <For each={ROUTES}>
          {(item) => (
            <Match when={path() === item.path}>
              <item.component />
            </Match>
          )}
        </For>
      </Switch>
    </div>
  );
}

render(() => <App />, document.getElementById("root") as MountableElement);
