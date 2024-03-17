import { createSlice } from "@reduxjs/toolkit";
import logs from "../data.json";

function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
}

const initialState = {
  events: logs.map((log, i) => ({
    id: simpleHash(log + i),
    msg: log,
  })),
};

export const filterSlice = createSlice({
  name: "logs",
  initialState,
});

export default filterSlice.reducer;
