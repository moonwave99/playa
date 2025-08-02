import { useQuery } from "@tanstack/react-query";
import type { Stats, BaseQuery } from "@/types/types";
import api from '../api';

type UseStats = BaseQuery & {
  stats: Stats;
};

export default function useStats(): UseStats {
  const { isPending, error, data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: api.stats.getStats,
  });

  return {
    stats,
    isPending,
    error,
  }
}