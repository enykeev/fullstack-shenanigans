import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  theme: 'DefaultTheme',
  locale: 'en-GB',
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.filter = action.payload
    },
    setLocale: (state, action) => {
      state.locale = action.payload
    }
  },
})

export const { setTheme, setLocale } = appSlice.actions

export default appSlice.reducer