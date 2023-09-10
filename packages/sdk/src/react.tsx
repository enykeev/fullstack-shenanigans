import type { AllMetaTypes, Context, Flag } from "@feature-flag-service/common";
import deepEqual from "fast-deep-equal";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { FeatureFlagService } from ".";

export const FeatureFlagContext = createContext<FeatureFlagService | undefined>(
  undefined,
);

export type FeatureFlagProviderProps = {
  config: {
    endpoint: string;
    appId: string;
    token: string;
  };
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

export type useFeatureFlagOptions = {
  context?: Context;
};

export function useFeatureFlag(
  flagId: Flag["flagId"],
  { context }: useFeatureFlagOptions = {},
) {
  const service = useContext(FeatureFlagContext);
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
        return undefined;
      }
      if (context) {
        const overrides = await service.getOverridesForContext(context);
        const override = overrides.find(
          (override) => override.flagId === flagId,
        );
        if (override) {
          setFlagValue({
            type: override.type,
            value: override.value,
          } as AllMetaTypes);
        } else {
          const flag = service.getDefaultFlagValue(flagId);
          setFlagValue(flag);
        }
      } else {
        const flag = service.getDefaultFlagValue(flagId);
        setFlagValue(flag);
      }
    }
    evaluateContext().catch((err) => {
      console.error(err);
    });
  }, [service, flagId, contextRef.current]);
  return flagValue;
}
