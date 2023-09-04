import { check } from "./executor";
import { parse } from "./parser";

export function filterPredicate(filter: string) {
  const node = parse(filter);
  return (item: Record<string, unknown>) => {
    return !!check(item, node);
  };
}

export function filter<T extends Record<string, unknown>>(
  collection: T[],
  filter: string,
): T[] {
  const predicate = filterPredicate(filter);
  return collection.filter(predicate);
}
