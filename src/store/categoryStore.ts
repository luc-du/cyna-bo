import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Constants
const CATEGORY_API_BASE_URL = '/api/v1/categories';

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No token found");
  return { Authorization: `Bearer ${token}` };
};

// Types
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
  description: string;
  products: Product[];
  images: Array<{
    id: number;
    name: string;
    url: string;
    uploadDate: string;
  }>;
  productCount?: number;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: { error?: string } | string | null;
}

// Initial state
const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const headers = getAuthHeaders();
    // Debug: log headers to ensure token is present
    console.log("fetchCategories headers:", headers);
    const response = await axios.get(CATEGORY_API_BASE_URL, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    // Debug: log error details for 400 errors
    if (error.response) {
      console.error("fetchCategories error response:", error.response);
      if (error.response.data && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
    }
    if (error.message === "No token found") {
      return rejectWithValue("Token manquant, veuillez vous reconnecter.");
    }
    return rejectWithValue('Failed to fetch categories');
  }
});

export const searchCategories = createAsyncThunk("categories/searchCategories", async (name: string, { rejectWithValue, dispatch }) => {
  try {
    // If search term is too short, grab all categories instead of using the search endpoint
    if (name.length < 3) {
      console.log("Search term too short, filtering categories client-side");
      const allCategories = await dispatch(fetchCategories()).unwrap();
      
      // Filter categories in the frontend based on the search term
      const searchTerm = name.toLowerCase();
      return Array.isArray(allCategories) 
        ? allCategories.filter((category: any) => 
            (category.name && category.name.toLowerCase().includes(searchTerm)) ||
            (category.description && category.description.toLowerCase().includes(searchTerm))
          )
        : [];
    }
    
    // Try the search endpoint if search term is long enough
    const response = await fetch(`${CATEGORY_API_BASE_URL}/search?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.warn(`Category search endpoint returned ${response.status}: ${response.statusText}`);
      
      // Fall back to client-side filtering
      const allCategories = await dispatch(fetchCategories()).unwrap();
      const searchTerm = name.toLowerCase();
      
      return Array.isArray(allCategories) 
        ? allCategories.filter((category: any) => 
            (category.name && category.name.toLowerCase().includes(searchTerm)) ||
            (category.description && category.description.toLowerCase().includes(searchTerm))
          )
        : [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Search category error:", error);
    // Return empty array instead of rejecting to prevent UI errors
    return [];
  }
});

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found");
      const response = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: categoryData,
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      return await response.text();
    } catch (error: any) {
      if (error.message === "No token found") {
        return rejectWithValue("Token manquant, veuillez vous reconnecter.");
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, formData }: { categoryId: number, formData: FormData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found");
      
      // Make sure the description is properly included in formData
      // The backend expects 'description' as a param just like 'name'
      
      const response = await fetch(`/api/v1/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        // Try to get more detailed error messages
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update category');
      }
      
      return await response.text();
    } catch (error: any) {
      if (error.message === "No token found") {
        return rejectWithValue("Token manquant, veuillez vous reconnecter.");
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk('categories/delete', async (id: number, { rejectWithValue }) => {
  try {
    const headers = getAuthHeaders();
    await axios.delete(`${CATEGORY_API_BASE_URL}/${id}`, {
      headers,
    });
    return id;
  } catch (error: any) {
    if (error.message === "No token found") {
      return rejectWithValue("Token manquant, veuillez vous reconnecter.");
    }
    return rejectWithValue('Failed to delete category');
  }
});

export const deleteMultipleCategories = createAsyncThunk(
  'categories/deleteMultiple',
  async (ids: number[], { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      await Promise.all(ids.map(id => axios.delete(`${CATEGORY_API_BASE_URL}/${id}`, {
        headers,
      })));
      return ids;
    } catch (error: any) {
      if (error.message === "No token found") {
        return rejectWithValue("Token manquant, veuillez vous reconnecter.");
      }
      return rejectWithValue('Failed to delete categories');
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  'categories/fetchDetails',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${CATEGORY_API_BASE_URL}/${categoryId}`, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error.message === "No token found") {
        return rejectWithValue("Token manquant, veuillez vous reconnecter.");
      }
      return rejectWithValue('Failed to fetch category details');
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: 'categories',
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
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Search failed";
        state.categories = [];
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        // Reload categories after creation to get the updated list with IDs
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        // Reload categories after update to get the updated list
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category.id !== action.payload);
      })
      .addCase(deleteMultipleCategories.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => !action.payload.includes(category.id));
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action) => {
        // Find the category in state and update it with detailed data
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      });
  },
});

export default categorySlice.reducer;
