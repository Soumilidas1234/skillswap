import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  sidebarOpen: boolean
  searchQuery: string
  notifications: number
}

const appSlice = createSlice({
  name: 'app',
  initialState: {
    sidebarOpen: true,
    searchQuery: '',
    notifications: 0,
  } as AppState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload },
    setSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload },
    setNotificationCount: (state, action: PayloadAction<number>) => { state.notifications = action.payload },
  },
})

export const { toggleSidebar, setSidebarOpen, setSearchQuery, setNotificationCount } = appSlice.actions

export const store = configureStore({
  reducer: { app: appSlice.reducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
