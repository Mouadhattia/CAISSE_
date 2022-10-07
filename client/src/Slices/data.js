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
  coupons:[],
  dataZ:[],
  isallowedLivraison:false,
  isallowedEmporter:false,
  ping:false

};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    storeCoupon:(state,action)=>{   
      state.coupons=action.payload.coupons
      console.log(state.coupons)
    },
    storeClients: (state, action) => {
      state.clients = action.payload.clients;
    },
    storeDataz: (state, action) => {
      state.dataZ = action.payload.dataZ;
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
      let con=0
      copy[prodIndex].active==0?con=1:con=0
      copy[prodIndex] = { ...copy[prodIndex], active:con };
      state.products = copy;
    },
    updateEmporter: (state, action) => {
state.isallowedEmporter=!state.isallowedEmporter
    },
    updateLivraison: (state, action) => {
      state.isallowedLivraison=!state.isallowedLivraison
          },

    setPing :(state,action)=>{
      state.ping =action.payload
    }
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
  storeCoupon,
  storeDataz,
  setPing
  
} = dataSlice.actions;
export default reducer;
