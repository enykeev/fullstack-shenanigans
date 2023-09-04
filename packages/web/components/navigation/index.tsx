import type { JSX } from "solid-js";

import { navigate } from "./state";

import "./styles.css";

export function Navigation({ children }: { children: JSX.Element }) {
  return <div class="Navigation">{children}</div>;
}

export function NavItem({
  children,
  href,
  external = false,
  ...rest
}: {
  children: JSX.Element;
  href: string;
  external?: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="Navigation__Item" {...rest}>
      {!external ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href}>{children}</a>
      )}
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

export function NavSpacer() {
  return <div class="Navigation__Spacer" />;
}
