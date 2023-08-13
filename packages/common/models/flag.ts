export type Flag = {
  appId: string;
  flagId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};
