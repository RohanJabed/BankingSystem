import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  activeAccountId: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "system",
  activeAccountId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => { state.theme = action.payload; },
    setActiveAccountId: (state, action: PayloadAction<string | null>) => { state.activeAccountId = action.payload; },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setActiveAccountId } = uiSlice.actions;
export default uiSlice.reducer;
