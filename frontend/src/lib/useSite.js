import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { DEFAULT_LOGO } from "@/lib/constants";

export const useSite = () => useQuery({ queryKey: ["site"], queryFn: async () => (await api.get("/site")).data, staleTime: 60_000 });

export const useSiteLogo = () => {
  const { data } = useSite();
  return data?.settings?.logoUrl || DEFAULT_LOGO;
};
