import { type Node } from "./ast";

export function check(obj: Record<string, unknown>, stage?: Node): unknown {
  if (!stage) {
    return false;
  }
  switch (stage.type) {
    case "accessor": {
      if (!stage.key) {
        throw new Error("node incomplete");
      }
      const path = stage.key.split(".");
      return path.reduce<unknown>((acc, key) => {
        if (typeof acc === "object" && !Array.isArray(acc)) {
          return (acc as Record<string, unknown>)[key];
        }
        return undefined;
      }, obj);
    }
    case "booleanValue":
    case "value": {
      return stage.value;
    }
    case "comparison": {
      if (!stage.left || !stage.right) {
        throw new Error("node incomplete");
      }
      switch (stage.subtype) {
        case "=": {
          return check(obj, stage.left) === check(obj, stage.right);
        }
        case "!=": {
          return check(obj, stage.left) !== check(obj, stage.right);
        }
        case "<": {
          return (
            (check(obj, stage.left) as number) <
            (check(obj, stage.right) as number)
          );
        }
        case "<=": {
          return (
            (check(obj, stage.left) as number) <=
            (check(obj, stage.right) as number)
          );
        }
        case ">": {
          return (
            (check(obj, stage.left) as number) >
            (check(obj, stage.right) as number)
          );
        }
        case ">=": {
          return (
            (check(obj, stage.left) as number) >=
            (check(obj, stage.right) as number)
          );
        }
        case "in": {
          return (check(obj, stage.right) as Array<unknown>).includes(
            check(obj, stage.left),
          );
        }
      }
      break;
    }
    case "boolean": {
      if (!stage.left || !stage.right) {
        throw new Error("node incomplete");
      }
      switch (stage.subtype) {
        case "&&": {
          return check(obj, stage.left) && check(obj, stage.right);
        }
        case "||": {
          return check(obj, stage.left) || check(obj, stage.right);
        }
      }
      break;
    }
    case "not": {
      if (!stage.value) {
        throw new Error("node incomplete");
      }
      return !check(obj, stage.value);
    }
    case "group": {
      if (!stage.value) {
        throw new Error("node incomplete");
      }
      return check(obj, stage.value);
    }
    case "list": {
      return stage.children.map((node) => check(obj, node));
    }
    default: {
      throw new Error("unknown AST type: ", stage);
    }
  }
}
