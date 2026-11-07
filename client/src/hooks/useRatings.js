import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { endpoints } from '@/lib/api';
import { setEventStats } from '@/lib/eventStats';
import { queryKeys } from './useQueries';

/** The signed-in user's star ratings (`{ [eventId]: 1–5 }`) plus a setter with optimistic update. */
export function useRatings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.myRatings,
    queryFn: endpoints.myRatings,
    enabled: Boolean(user),
    staleTime: 5 * 60_000,
    select: (d) => d.ratings,
  });

  const mutation = useMutation({
    mutationFn: ({ eventId, value }) => endpoints.rateEvent(eventId, value),
    onMutate: async ({ eventId, value }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.myRatings });
      const previous = queryClient.getQueryData(queryKeys.myRatings);
      queryClient.setQueryData(queryKeys.myRatings, (d) => {
        const ratings = { ...d?.ratings };
        if (value) ratings[eventId] = value;
        else delete ratings[eventId];
        return { ratings };
      });
      return { previous };
    },
    onSuccess: ({ value, rating, ratingCount }, { eventId }) => {
      setEventStats(eventId, { rating, ratingCount });
      toast.success(value ? `You rated this ${value} out of 5` : 'Rating removed');
    },
    onError: (err, _vars, ctx) => {
      queryClient.setQueryData(queryKeys.myRatings, ctx?.previous);
      toast.error('Couldn’t save your rating', { description: err.message });
    },
  });

  return {
    ratingOf: (eventId) => data?.[eventId] ?? 0,
    rate: (eventId, value) => mutation.mutate({ eventId, value }),
  };
}
