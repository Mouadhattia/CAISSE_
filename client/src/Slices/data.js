import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
  zones: [],
  tables: [],
  categories: [],
  products: [],
  nSteps: [],
  orderHistory: [],
  clients: [],
  tva_mode: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    storeClients: (state, action) => {
      state.clients = action.payload.clients;
    },
    storeZones: (state, action) => {
      state.zones = action.payload.zones;
    },
    storeTables: (state, action) => {
      state.tables = action.payload.tables;
    },
    storeCategories: (state, action) => {
      state.categories = action.payload.categories;
    },
    storeProducts: (state, action) => {
      state.products = action.payload.products;
    },
    storeNSteps: (state, action) => {
      state.nSteps = action.payload.nSteps;
    },
    storeOrderHistory: (state, action) => {
      state.orderHistory = action.payload.orderHistory;
    },
    storeTvaMode: (state, action) => {
      state.tva_mode = action.payload.tva_mode;
    },
    updateProduct: (state, action) => {
      let prodIndex = state.products.findIndex(
        (prod) => prod.id == action.payload.id
      );
      let copy = [...state.products];
      copy[prodIndex] = { ...copy[prodIndex], active: 0 };
      state.products = copy;
    },
  },
});

const { reducer } = dataSlice;
export const {
  storeZones,
  storeTables,
  storeCategories,
  storeProducts,
  storeNSteps,
  storeOrderHistory,
  storeClients,
  updateProduct,
  storeTvaMode,
} = dataSlice.actions;
export default reducer;
