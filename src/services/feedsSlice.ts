import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi, getOrderByNumberApi } from '../utils/burger-api';
import { TOrder } from '../utils/types';

export const fetchFeeds = createAsyncThunk('feeds/fetchFeeds', async () => {
  const data = await getFeedsApi();
  return data;
});

export const fetchOrderByNumber = createAsyncThunk(
  'feeds/fetchOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data;
  }
);

type TFeedsState = {
  orders: TOrder[];
  orderByNumber: TOrder | null;
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: TFeedsState = {
  orders: [],
  orderByNumber: null,
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null
};

export const feedsSlice = createSlice({
  name: 'feeds',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Не удалось загрузить ленту заказов';
      })

      .addCase(fetchOrderByNumber.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.orderByNumber = action.payload.orders[0] || null;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.error = action.error.message || 'Заказ не найден';
      });
  }
});

export const selectFeedsState = (state: { feeds: TFeedsState }) => state.feeds;

export default feedsSlice.reducer;
