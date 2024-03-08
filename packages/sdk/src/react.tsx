import type {
  AllMetaTypes,
  Audience,
  Context,
  Flag,
} from "@feature-flag-service/common";
import deepEqual from "fast-deep-equal";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type FeatureFlagListener,
  FeatureFlagService,
  type FeatureFlagServiceArgs,
} from ".";

export const FeatureFlagContext = createContext<FeatureFlagService | undefined>(
  undefined,
);

export type FeatureFlagProviderProps = {
  config: FeatureFlagServiceArgs;
  children: ReactNode;
};

export function FeatureFlagProvider({
  config,
  children,
}: FeatureFlagProviderProps) {
  const [service, setService] = useState(
    undefined as FeatureFlagService | undefined,
  );

  useEffect(() => {
    const service = new FeatureFlagService(config);
    service.init().then(() => {
      setService(service);
    });
  }, []);

  return (
    <FeatureFlagContext.Provider value={service}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlagsService() {
  const service = useContext(FeatureFlagContext);
  return service;
}

export type useFeatureFlagOptions = {
  context?: Context;
  audienceId?: Audience["audienceId"];
  live?: boolean;
};

export function useFeatureFlag(
  flagId: Flag["flagId"],
  { context, audienceId, live = false }: useFeatureFlagOptions = {},
) {
  const service = useFeatureFlagsService();
  const [flagValue, setFlagValue] = useState(
    undefined as AllMetaTypes | undefined,
  );
  const contextRef = useRef(undefined as Context | undefined);

  if (!deepEqual(context, contextRef.current)) {
    contextRef.current = context;
  }

  useEffect(() => {
    async function evaluateContext() {
      if (!service) {
        return;
      }

      // TODO: There's a valid reason for evaluating feature flags server side
      // if number of flags is getting out of hand and we want to avoid
      // pulling them all down to the client. To this end, I'm going to leave
      // this snippet in here for now.
      //
      // if (context) {
      //   const overrides = await service.getOverridesForContext(context);
      //   const override = overrides.find(
      //     (override) => override.flagId === flagId,
      //   );
      //   if (override) {
      //     setFlagValue({
      //       type: override.type,
      //       value: override.value,
      //     } as AllMetaTypes);
      //     return;
      //   }
      // }

      const flag = service.getFlagValue(flagId, { audienceId, context });
      setFlagValue(flag);
    }
    evaluateContext().catch((err) => {
      console.error(err);
    });
    if (live && service) {
      const fn: FeatureFlagListener = (err) => {
        if (!err) {
          evaluateContext();
        }
      };
      service.addListener(fn);
      return () => {
        service.removeListener(fn);
      };
    }
  }, [service, flagId, contextRef.current]);
  return flagValue;
}
