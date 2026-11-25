import { baseApi } from "../services/api";
import type { ITransaction, ApiResponse, PaginatedResponse } from "@/types";

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyTransactions: builder.query<ApiResponse<PaginatedResponse<ITransaction>>, { page?: number; limit?: number; type?: string; status?: string; accountId?: string }>({
      query: (params) => ({ url: "/transactions", params }),
      providesTags: ["Transaction"],
    }),
    getTransactionById: builder.query<ApiResponse<ITransaction>, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Transaction", id }],
    }),
    getAllTransactions: builder.query<ApiResponse<PaginatedResponse<ITransaction>>, { page?: number; limit?: number; type?: string; status?: string; search?: string }>({
      query: (params) => ({ url: "/admin/transactions", params }),
      providesTags: ["Transaction"],
    }),
    getStaffTransactions: builder.query<ApiResponse<PaginatedResponse<ITransaction>>, { page?: number; limit?: number; type?: string; status?: string; search?: string }>({
      query: (params) => ({ url: "/staff/transactions", params }),
      providesTags: ["Transaction"],
    }),
    getFlaggedTransactions: builder.query<ApiResponse<PaginatedResponse<ITransaction>>, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/admin/suspicious", params }),
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetMyTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetAllTransactionsQuery,
  useGetStaffTransactionsQuery,
  useGetFlaggedTransactionsQuery,
} = transactionApi;
