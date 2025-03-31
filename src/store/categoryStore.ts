import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const CATEGORY_API_BASE_URL = "/api/v1/categories";

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non disponible");
      }
      const response = await axios.get(CATEGORY_API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data ||
          "Erreur lors de la récupération des catégories"
      );
    }
  }
);

// Search categories by name
export const searchCategories = createAsyncThunk(
  "categories/searchCategories",
  async (query: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non disponible");
      }
      const response = await axios.get(
        `${CATEGORY_API_BASE_URL}/search?name=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data ||
          "Erreur lors de la recherche des catégories"
      );
    }
  }
);

interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  caracteristics: string;
  pricingModel: string;
  price: number;
  images: Array<{
    id: number;
    name: string;
    url: string;
    uploadDate: string;
  }>;
  status: string;
}

interface Category {
  id: number;
  name: string;
  products: Product[];
  images: Array<{
    id: number;
    name: string;
    url: string;
    uploadDate: string;
  }>;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;
