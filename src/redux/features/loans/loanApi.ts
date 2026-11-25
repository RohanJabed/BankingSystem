import { baseApi } from "../../services/api";
import type { ILoan, ApiResponse, PaginatedResponse } from "@/types";

export const loanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLoans: builder.query<ApiResponse<ILoan[]>, void>({
      query: () => "/loans",
      providesTags: ["Loan"],
    }),
    getLoanById: builder.query<ApiResponse<ILoan>, string>({
      query: (id) => `/loans/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Loan", id }],
    }),
    getAllLoans: builder.query<ApiResponse<PaginatedResponse<ILoan>>, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/admin/loans", params }),
      providesTags: ["Loan"],
    }),
    getStaffLoans: builder.query<ApiResponse<PaginatedResponse<ILoan>>, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/staff/loans", params }),
      providesTags: ["Loan"],
    }),
    markUnderReview: builder.mutation<ApiResponse<ILoan>, { id: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/loans/${id}/review`, method: "PATCH", body: { status: "UNDER_REVIEW", ...body } }),
      invalidatesTags: ["Loan"],
    }),
    applyLoan: builder.mutation<ApiResponse<ILoan>, {
      accountId: string;
      loanType: string;
      requestedAmount: number;
      durationMonths: number;
      monthlyIncome: number;
      employmentStatus: string;
      description: string;
    }>({
      query: (body) => ({ url: "/loans", method: "POST", body }),
      invalidatesTags: ["Loan"],
    }),
    reviewLoan: builder.mutation<ApiResponse<ILoan>, { id: string; status: string; approvedAmount?: number; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/loans/${id}/review`, method: "PATCH", body }),
      invalidatesTags: ["Loan", "Account", "Transaction", "Notification"],
    }),
    repayLoan: builder.mutation<ApiResponse<{ transactionRef: string }>, { id: string; accountId: string; amount: number; pin: string; idempotencyKey: string }>({
      query: ({ id, ...body }) => ({ url: `/loans/${id}/repay`, method: "POST", body }),
      invalidatesTags: ["Loan", "Account", "Transaction", "Notification"],
    }),
  }),
});

export const {
  useGetMyLoansQuery,
  useGetLoanByIdQuery,
  useGetAllLoansQuery,
  useGetStaffLoansQuery,
  useMarkUnderReviewMutation,
  useApplyLoanMutation,
  useReviewLoanMutation,
  useRepayLoanMutation,
} = loanApi;
