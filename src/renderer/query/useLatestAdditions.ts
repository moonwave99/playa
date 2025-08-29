import { useQuery } from "@tanstack/react-query";
import type { Release, BaseQuery } from "@/types/types";
import api from "../api";

type UseLatestAdditions = BaseQuery & {
  latestAdditions: Record<string, Pick<Release, "id" | "createdAt">[]>;
};

export default function useLatestAdditions(from: string): UseLatestAdditions {
  const {
    isPending,
    error,
    data: latestAdditions,
  } = useQuery({
    queryKey: ["latestAdditions", from],
    queryFn: () => api.release.getLatestAdditions(from),
  });

  return {
    latestAdditions,
    isPending,
    error,
  };
}
