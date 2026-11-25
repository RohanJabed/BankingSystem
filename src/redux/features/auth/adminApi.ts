import { baseApi } from "../services/api";
import type { IUser, ApiResponse, PaginatedResponse, DashboardStats } from "@/types";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
    getChartData: builder.query<ApiResponse<unknown>, void>({
      query: () => "/admin/dashboard/charts",
      providesTags: ["Dashboard"],
    }),
    getAllCustomers: builder.query<ApiResponse<PaginatedResponse<IUser>>, { page?: number; limit?: number; search?: string; role?: string }>({
      query: (params) => ({ url: "/admin/customers", params }),
      providesTags: ["User"],
    }),
    getCustomerById: builder.query<ApiResponse<IUser>, string>({
      query: (id) => `/admin/customers/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
    updateCustomerStatus: builder.mutation<ApiResponse<IUser>, { id: string; isActive?: boolean; isBlocked?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/admin/customers/${id}`, method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    getBankingSettings: builder.query<ApiResponse<unknown>, void>({
      query: () => "/admin/settings",
      providesTags: ["Settings"],
    }),
    updateBankingSettings: builder.mutation<ApiResponse<unknown>, Record<string, number>>({
      query: (body) => ({ url: "/admin/settings", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetChartDataQuery,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerStatusMutation,
  useGetBankingSettingsQuery,
  useUpdateBankingSettingsMutation,
} = adminApi;
