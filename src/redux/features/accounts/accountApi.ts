import { baseApi } from "../services/api";
import type { IAccount, ApiResponse, PaginatedResponse } from "@/types";

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAccounts: builder.query<ApiResponse<IAccount[]>, void>({
      query: () => "/accounts/my",
      providesTags: ["Account"],
    }),
    getAccountById: builder.query<ApiResponse<IAccount>, string>({
      query: (id) => `/accounts/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Account", id }],
    }),
    getAllAccounts: builder.query<ApiResponse<PaginatedResponse<IAccount>>, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({ url: "/admin/accounts", params }),
      providesTags: ["Account"],
    }),
    createAccount: builder.mutation<ApiResponse<IAccount>, { userId: string; accountType: string }>({
      query: (body) => ({ url: "/accounts", method: "POST", body }),
      invalidatesTags: ["Account"],
    }),
    updateAccount: builder.mutation<ApiResponse<IAccount>, { id: string; data: Partial<IAccount> }>({
      query: ({ id, data }) => ({ url: `/accounts/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Account", id }, "Account"],
    }),
    transfer: builder.mutation<ApiResponse<{ transactionRef: string }>, {
      senderAccountId: string;
      receiverAccountNumber: string;
      amount: number;
      description?: string;
      pin: string;
      idempotencyKey: string;
    }>({
      query: (body) => ({ url: "/transactions/transfer", method: "POST", body }),
      invalidatesTags: ["Account", "Transaction", "Notification"],
    }),
  }),
});

export const {
  useGetMyAccountsQuery,
  useGetAccountByIdQuery,
  useGetAllAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useTransferMutation,
} = accountApi;
