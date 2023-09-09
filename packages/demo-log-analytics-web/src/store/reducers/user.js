import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  username: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.username = action.payload
    },
  },
})

export const { login } = userSlice.actions

export default userSlice.reducer