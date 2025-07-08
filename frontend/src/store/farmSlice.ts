import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '.';

export interface Farm {
  _id?: string;
  name: string;
  area: string;
  city: string;
  user: string;
  pesticides?: string;
  waterStatus?: string;
}

interface FarmState {
  farms: Farm[];
  loading: boolean;
  error: string | null;
}

const initialState: FarmState = {
  farms: [],
  loading: false,
  error: null,
};

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchFarms = createAsyncThunk<
  Farm[],
  string,
  { state: RootState }
>('farms/fetchFarms', async (userId, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/farms/user/${userId}`);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.error || 'Failed to fetch farms');
  }
});

export const addFarm = createAsyncThunk<
  Farm,
  Omit<Farm, '_id'>,
  { state: RootState }
>('farms/addFarm', async (farm, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/farms`, farm);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.error || 'Failed to add farm');
  }
});

export const updateFarm = createAsyncThunk<
  Farm,
  Farm,
  { state: RootState }
>('farms/updateFarm', async (farm, thunkAPI) => {
  try {
    const res = await axios.put(`${API_URL}/farms/${farm._id}`, farm);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.error || 'Failed to update farm');
  }
});

export const deleteFarm = createAsyncThunk<
  string,
  string,
  { state: RootState }
>('farms/deleteFarm', async (farmId, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/farms/${farmId}`);
    return farmId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.error || 'Failed to delete farm');
  }
});

const farmSlice = createSlice({
  name: 'farms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action: PayloadAction<Farm[]>) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addFarm.fulfilled, (state, action: PayloadAction<Farm>) => {
        state.farms.push(action.payload);
      })
      .addCase(updateFarm.fulfilled, (state, action: PayloadAction<Farm>) => {
        const idx = state.farms.findIndex(f => f._id === action.payload._id);
        if (idx !== -1) state.farms[idx] = action.payload;
      })
      .addCase(deleteFarm.fulfilled, (state, action: PayloadAction<string>) => {
        state.farms = state.farms.filter(f => f._id !== action.payload);
      });
  },
});

export default farmSlice.reducer; 