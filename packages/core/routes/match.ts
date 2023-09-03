import { Hono } from "hono";
import * as store from "../store";
import { MatchRequest } from "@feature-flag-service/common/models/match";
import { filterPredicate } from "../../filter-query";

const router = new Hono<{ Variables: Variables }>();

export const PostMatchBody = MatchRequest;

router.post("/", async (c) => {
  const appId = c.get("X-App-Id");
  const params = PostMatchBody.safeParse(await c.req.json());
  if (!params.success) {
    return c.json({ error: "invalid params" }, 400);
  }
  const { returns, context } = params.data;
  switch (returns) {
    case "audiences": {
      const audiences = store.listAudiences({ appId });
      const res = audiences.filter(({ filter }) => {
        return filterPredicate(filter)(context);
      });
      return c.json(res);
    }
    case "overrides": {
      const overrides = store.listOverrides({ appId });
      const res = overrides.filter(({ audience }) => {
        return filterPredicate(audience.filter)(context);
      });
      return c.json(res);
    }
    case "flags": {
      const flags = store.listFlags({ appId });
      const res = flags.map((flag) => {
        for (const override of flag.overrides) {
          const predicate = filterPredicate(override.audience.filter);
          if (predicate(context)) {
            return {
              ...flag,
              type: override.type,
              value: override.value,
            };
          }
        }
        return flag;
      });
      return c.json(res);
    }
  }
});

export default router;
