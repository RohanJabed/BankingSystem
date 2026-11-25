import { baseApi } from "../../services/api";
import type { IDepositRequest, IWithdrawalRequest, ApiResponse, PaginatedResponse } from "@/types";

export const depositApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyDeposits: builder.query<ApiResponse<PaginatedResponse<IDepositRequest>>, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/deposits", params }),
      providesTags: ["Deposit"],
    }),
    getAllDeposits: builder.query<ApiResponse<PaginatedResponse<IDepositRequest>>, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/admin/deposits", params }),
      providesTags: ["Deposit"],
    }),
    requestDeposit: builder.mutation<ApiResponse<IDepositRequest>, { accountId: string; amount: number; description?: string }>({
      query: (body) => ({ url: "/deposits", method: "POST", body }),
      invalidatesTags: ["Deposit"],
    }),
    reviewDeposit: builder.mutation<ApiResponse<IDepositRequest>, { id: string; status: "APPROVED" | "REJECTED"; reviewNote?: string }>({
      query: ({ id, ...body }) => ({ url: `/deposits/${id}/review`, method: "PATCH", body }),
      invalidatesTags: ["Deposit", "Account", "Transaction", "Notification"],
    }),
    getMyWithdrawals: builder.query<ApiResponse<PaginatedResponse<IWithdrawalRequest>>, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/withdrawals", params }),
      providesTags: ["Withdrawal"],
    }),
    getAllWithdrawals: builder.query<ApiResponse<PaginatedResponse<IWithdrawalRequest>>, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/admin/withdrawals", params }),
      providesTags: ["Withdrawal"],
    }),
    requestWithdrawal: builder.mutation<ApiResponse<IWithdrawalRequest>, { accountId: string; amount: number; description?: string }>({
      query: (body) => ({ url: "/withdrawals", method: "POST", body }),
      invalidatesTags: ["Withdrawal"],
    }),
    reviewWithdrawal: builder.mutation<ApiResponse<IWithdrawalRequest>, { id: string; status: "APPROVED" | "REJECTED"; reviewNote?: string }>({
      query: ({ id, ...body }) => ({ url: `/withdrawals/${id}/review`, method: "PATCH", body }),
      invalidatesTags: ["Withdrawal", "Account", "Transaction", "Notification"],
    }),
  }),
});

export const {
  useGetMyDepositsQuery,
  useGetAllDepositsQuery,
  useRequestDepositMutation,
  useReviewDepositMutation,
  useGetMyWithdrawalsQuery,
  useGetAllWithdrawalsQuery,
  useRequestWithdrawalMutation,
  useReviewWithdrawalMutation,
} = depositApi;
