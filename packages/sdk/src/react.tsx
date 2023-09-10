import type { Flag } from "@feature-flag-service/common";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
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
    console.log("init");
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

export function useFeatureFlag(flagId: Flag["flagId"]) {
  const service = useContext(FeatureFlagContext);
  if (!service) {
    return undefined;
  }
  const flag = service.getDefaultFlagValue(flagId);
  if (flag) {
    return flag;
  }
}
