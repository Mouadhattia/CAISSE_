import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  monnaies: [],
  initialValue: 0,
};

const caisseSlice = createSlice({
  name: "caisse",
  initialState,
  reducers: {
    setMonnaies: (state, action) => {
      state.monnaies = action.payload.monnaies;
    },
    clearcaisse: () => {
      return { caisse: "" };
    },
    setInitialValue: (state, action) => {
      state.initialValue = action.payload.montant;
    },
  },
});

const { reducer, actions } = caisseSlice;

export const { setMonnaies, clearcaisse, setInitialValue } = actions;
export default reducer;
