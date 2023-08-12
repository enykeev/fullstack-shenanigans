import type { JSX } from "solid-js";

import "./styles.css";

export function Navigation({ children }: { children: JSX.Element }) {
  return <div class="Navigation">{children}</div>;
}

export function NavItem({
  children,
  href,
  onClick,
  ...rest
}: {
  children: JSX.Element;
  href: string;
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>;
} & JSX.HTMLAttributes<HTMLDivElement>) {
  const clickHandler: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    if (!onClick || !e) {
      return;
    }
    e.preventDefault();
    return onClick(e);
  };
  return (
    <div class="Navigation__Item" onClick={clickHandler} {...rest}>
      <a href={href}>{children}</a>
    </div>
  );
}
