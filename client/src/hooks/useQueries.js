import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api';

export const queryKeys = {
  events: (params) => ['events', params],
  meta: ['events', 'meta'],
  event: (slug) => ['event', slug],
  ticket: (code) => ['ticket', code],
  me: ['me'],
  myRegistrations: ['registrations', 'me'],
  hosted: ['events', 'hosted'],
  attendees: (id) => ['attendees', id],
};

export const useEventList = (params, options = {}) =>
  useQuery({
    queryKey: queryKeys.events(params),
    queryFn: ({ signal }) => endpoints.events(params, signal),
    placeholderData: keepPreviousData,
    ...options,
  });

/** Paginated list for the Explore page ("Load more"). */
export const useInfiniteEvents = (params) =>
  useInfiniteQuery({
    queryKey: queryKeys.events({ ...params, infinite: true }),
    queryFn: ({ pageParam, signal }) => endpoints.events({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

export const useMeta = () => useQuery({ queryKey: queryKeys.meta, queryFn: endpoints.meta, staleTime: 5 * 60_000 });

export const useEvent = (slug) =>
  useQuery({ queryKey: queryKeys.event(slug), queryFn: () => endpoints.event(slug), enabled: Boolean(slug) });
