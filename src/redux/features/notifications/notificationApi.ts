import { baseApi } from "../services/api";
import type { INotification, ApiResponse } from "@/types";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<{ notifications: INotification[]; unreadCount: number }>, void>({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation<ApiResponse, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    markAllAsRead: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
