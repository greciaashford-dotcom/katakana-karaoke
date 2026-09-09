import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { DEFAULT_LOGO } from "@/lib/constants";

export const useSiteLogo = () => {
  const { data } = useQuery({ queryKey: ["site"], queryFn: async () => (await api.get("/site")).data });
  return data?.settings?.logoUrl || DEFAULT_LOGO;
};
