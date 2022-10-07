import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  checkoutData: [],
  currentOrders: [],
  selectedTable: {},
  client: {},
  nbrCouverts: 0,
  remarque: "",
  orderType:"sur place",
  ordersPartage :[],
  partNotPaid:0
};



const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setRemarque: (state, action) => {
      state.remarque = action.payload.remarque;
    },
    storeSelectedTable: (state, action) => {
      console.log(action.payload);
      state.selectedTable = action.payload.selectedTable;
    },
    setNbrCouverts: (state, action) => {
      state.nbrCouverts = action.payload.nbrCouverts;
    },
    setNewCurrentOrder: (state, action) => {
      state.currentOrders = [...state.currentOrders, action.payload.order];
    },
    setNewOrder: (state, action) => {
      let i = state.orders.findIndex(
        (order) => order.id == action.payload.order.id
      );
      let ordersCopy = [...state.orders];
     
      if(i!=-1 && !action.payload.order.is_supp){
        ordersCopy[i]={...ordersCopy[i],qt:ordersCopy[i].qt+1}
        state.orders=[...ordersCopy]
      }else{
        state.orders = [...state.orders, action.payload.order];
      }
    
   
    },
    setOrderChange: (state, action) => {
      let i = state.orders.findIndex(
        (order) => order.id == action.payload.order.id
      );
      let ordersCopy = [...state.orders];

      ordersCopy[action.payload.key] = action.payload.order;
      state.orders = [...ordersCopy];
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(
        (_, index) => index != action.payload.key
      );
    },
    clearOrders: (state, action) => {
      state.orders = [];
    },
    clearData: (state, action) => {
      state.checkoutData = [];
    },
    addNewcheckoutData: (state, action) => {
      let check = state.checkoutData.some(
        (e) => e.order_id == action.payload.order.order_id
      );
      if(!check){
        state.checkoutData = [...state.checkoutData, action.payload.order];
        
      }   
      
     
    },
    addNewcheckoutDataFromDB: (state, action) => {
      let i = state.checkoutData.findIndex(
        (el) => el.order_id == action.payload.order.order_id
      );
     
      
      if (i == -1) {
        let orderFromDb = action.payload.order.orderItems.map(item=>{
          return item = {...item,qt:item.quantity}
         
        })
        let taxPrice = action.payload.order.tva*action.payload.order.price/100
        
        state.checkoutData = [...state.checkoutData, {...action.payload.order,orderItems:orderFromDb,orderType:action.payload.order.order_type,taxPrice:taxPrice}];
      }
    },
    deletecheckoutData: (state, action) => {
      state.checkoutData = state.checkoutData.filter(
        (x) => x.order_id != action.payload.order_id
      );
    },
    setCheckoutChange: (state, action) => {
      let i = state.checkoutData.findIndex(
        (order) => order.order_id == action.payload.order.order_id
      );
      let ordersCopy = [...state.checkoutData];
      ordersCopy[i] = action.payload.order;
      state.checkoutData = [...ordersCopy];
    },
    initClient: (state, action) => {
     
      state.client = action.payload.client;
    },
    deleteClientandTable: (state, action) => {
      state.client = {};
      state.selectedTable = {};
    },
    cancelOrder:(state,action)=>{
      
      let x=[...state.checkoutData]
      x.forEach(e=>{
        if ( e.order_id==action.payload.order_id){
          e=action.payload
      
          state.checkoutData=[]
        }
        
      })
      
    },
    setType :(state,action)=>{
      state.orderType = action.payload
    },
    setOrderPartage:(state,action)=>{
  
     state.ordersPartage= action.payload
    
    },
    editordersPartage:(state,action)=>{
      if(action.payload.amount<=0){
        state.partNotPaid = state.partNotPaid -1
      }
      let i = state.ordersPartage.findIndex(
        (order) => order.partId == action.payload.partId
      );
      let Copy = [...state.ordersPartage];
      Copy[i] = action.payload;
      state.ordersPartage = [...Copy];
    },
    clearOrdersPartage:(state,action)=>{
      state.ordersPartage =[]
    },
    setPartNotPaid :(state,action)=>{
      state.partNotPaid= action.payload
    },
    updateReapartirItems:(state,action)=>{
      let copy = [...state.ordersPartage]
      let disIndex =Number(action.payload.destination.droppableId)
      let sourceIndex =Number(action.payload.source.droppableId)
      let itemId =Number(action.payload.draggableId)
      if(disIndex!=sourceIndex){
        copy[disIndex]={
          ...copy[disIndex],
          orderItems:[...copy[disIndex].orderItems,copy[sourceIndex].orderItems.filter(el=>el.repatirId==itemId)[0]],
          totalPrice:copy[disIndex].totalPrice+copy[sourceIndex].orderItems.filter(el=>el.repatirId==itemId)[0].price,
          amount:copy[disIndex].totalPrice+copy[sourceIndex].orderItems.filter(el=>el.repatirId==itemId)[0].price
        }
        copy[sourceIndex]={
          ...copy[sourceIndex],
          orderItems:copy[sourceIndex].orderItems.filter(el=>el.repatirId!=itemId),
          totalPrice: copy[sourceIndex].totalPrice-copy[sourceIndex].orderItems.filter(el=>el.repatirId==itemId)[0].price,
          amount:copy[sourceIndex].totalPrice-copy[sourceIndex].orderItems.filter(el=>el.repatirId==itemId)[0].price
        }
       state.ordersPartage =[...copy]
      }
      
    }
    

    
  },
});

const { reducer } = orderSlice;
export const {
  storeSelectedTable,
  setNbrCouverts,
  setNewOrder,
  setOrderChange,
  deleteOrder,
  addNewcheckoutData,
  clearOrders,
  deletecheckoutData,
  initClient,
  deleteClientandTable,
  setNewCurrentOrder,
  setCheckoutChange,
  addNewcheckoutDataFromDB,
  setRemarque,
  cancelOrder,
  clearData,
  setType,
  setOrderPartage,
  editordersPartage,
  clearOrdersPartage,
  setPartNotPaid,
  updateReapartirItems
} = orderSlice.actions;
export default reducer;
