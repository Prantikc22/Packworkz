import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export interface DashboardQuote {
  id: string;
  quote_id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  items: any[];
  delivery_country: string;
  delivery_pincode?: string;
  preferred_timeline: string;
  notes?: string;
  total_estimated_min: number | null;
  total_estimated_max: number | null;
  status: string;
  user_id?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface AcceptQuoteResult {
  order_id: string;
  id: string;
  message: string;
}

export const getDashboardQuotes = async (tab?: string): Promise<DashboardQuote[]> => {
  const url = tab ? `/api/dashboard/quotes?tab=${tab}` : "/api/dashboard/quotes";
  return customFetch<DashboardQuote[]>(url, { method: "GET" });
};

export const getDashboardQuotesQueryKey = (tab?: string) => [`/api/dashboard/quotes`, tab] as const;

export function useGetDashboardQuotes(tab?: string) {
  return useQuery({
    queryKey: getDashboardQuotesQueryKey(tab),
    queryFn: ({ signal }) => getDashboardQuotes(tab),
  });
}

export const acceptDashboardQuote = async (id: string): Promise<AcceptQuoteResult> => {
  return customFetch<AcceptQuoteResult>(`/api/dashboard/quotes/${id}/accept`, { method: "POST" });
};

export function useAcceptDashboardQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptDashboardQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/overview"] });
    },
  });
}
