import type { z } from "zod";

export const validateValue =
  <T>(arg: T) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <S extends z.ZodType<T, any, any>>(_arg: S) => {
    return arg;
  };

export const validateArray =
  <T>(arg: T[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <S extends z.ZodType<T, any, any>>(_arg: S) => {
    return arg;
  };
