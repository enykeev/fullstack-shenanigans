import type { JSX } from "solid-js";

import "./state";

import "./styles.css";
import { navigate } from "./state";

export function Navigation({ children }: { children: JSX.Element }) {
  return <div class="Navigation">{children}</div>;
}

export function NavItem({
  children,
  href,
  ...rest
}: {
  children: JSX.Element;
  href: string;
} & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="Navigation__Item" {...rest}>
      <Link href={href}>{children}</Link>
    </div>
  );
}

export type LinkProps = {
  href: string;
  children: JSX.Element;
};

export function Link(props: LinkProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();

    navigate(props.href);
  };
  return (
    <a href={props.href} onClick={handleClick}>
      {props.children}
    </a>
  );
}
