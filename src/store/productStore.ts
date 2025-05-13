import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "../types";

const PRODUCT_API_BASE_URL = "/api/v1/products";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Ensure category details are included in the response
      const response = await fetch(`${PRODUCT_API_BASE_URL}?includeCategoryDetails=true`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      return data.map((product: any) => ({
        ...product,
        category: product.category || null, // Ensure category data is included
      }));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Error fetching products");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${PRODUCT_API_BASE_URL}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Erreur lors de la récupération du produit");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${PRODUCT_API_BASE_URL}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return productId;
    } catch (error) {
      return rejectWithValue("Erreur lors de la suppression du produit");
    }
  }
);

export const deleteMultipleProducts = createAsyncThunk(
  "products/deleteMultipleProducts",
  async (productIds: number[], { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        productIds.map((id) =>
          axios.delete(`${PRODUCT_API_BASE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      return productIds;
    } catch (error) {
      return rejectWithValue("Erreur lors de la suppression des produits");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, data }: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const hasImages = data.getAll("images").length > 0;
      let url = "";
      let body: FormData;

      if (hasImages) {
        // Only send images for the images endpoint
        url = `/api/v1/products/${id}/images`;
        body = new FormData();
        data.getAll("images").forEach((img) => {
          body.append("images", img as File);
        });
      } else {
        // Send all product fields (excluding images) for the product info endpoint
        url = `/api/v1/products`;
        body = new FormData();
        data.forEach((value, key) => {
          if (key !== "images") {
            body.append(key, value);
          }
        });
        body.set("id", String(id)); // Ensure id is present in the DTO
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type for FormData; browser will set it
        } as any,
        body,
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (data: FormData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      
      data.append("ignoreStripeErrors", "true");
      data.append("skipStripeOnError", "true");
      
      const response = await fetch(PRODUCT_API_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      
      const responseText = await response.text();
      console.log("Product creation response:", responseText);
      
      if (!response.ok) {
        console.error("Server error:", responseText);
        
        if (responseText.includes("Product already exists") || 
            responseText.includes("stripe") || 
            responseText.includes("subscription")) {
          
          console.log("Detected Stripe product existence error, checking if product was created");
          await dispatch(fetchProducts());
          
          return { 
            message: "Product created but Stripe reports it already exists. This is likely because of a previous attempt.",
            stripeError: true 
          };
        }
        
        throw new Error(responseText || "Failed to create product");
      }
      
      let newProduct;
      try {
        newProduct = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.log("Response is not JSON, using as is");
        newProduct = { message: responseText };
      }
      
      await dispatch(fetchProducts());
      
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Erreur lors de la création du produit");
    }
  }
);

export const deleteProductImage = createAsyncThunk(
  "products/deleteProductImage",
  async ({ productId, imageId }: { productId: number; imageId: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${PRODUCT_API_BASE_URL}/${productId}/images`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { imageId }, // Send imageId in the request body
      });
      return { productId, imageId };
    } catch (error) {
      return rejectWithValue("Erreur lors de la suppression de l'image");
    }
  }
);

export const searchProducts = createAsyncThunk("products/searchProducts", async (name: string, { rejectWithValue, dispatch }) => {
  try {
    // If search term is too short, grab all products instead of using the search endpoint
    if (name.length < 3) {
      console.log("Search term too short, fetching all products instead");
      const allProducts = await dispatch(fetchProducts()).unwrap();
      
      // Filter products in the frontend based on the search term
      const searchTerm = name.toLowerCase();
      return Array.isArray(allProducts) 
        ? allProducts.filter((product: any) => 
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
          )
        : [];
    }
    
    // Try the search endpoint if search term is long enough
    const response = await fetch(`${PRODUCT_API_BASE_URL}/search?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.warn(`Search endpoint returned ${response.status}: ${response.statusText}`);
      
      // Fall back to client-side filtering
      const allProducts = await dispatch(fetchProducts()).unwrap();
      const searchTerm = name.toLowerCase();
      
      return Array.isArray(allProducts) 
        ? allProducts.filter((product: any) => 
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
          )
        : [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Search error:", error);
    // Return empty array instead of rejecting to prevent UI errors
    return [];
  }
});
 



export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (productId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      // Add includeCategoryDetails=true to ensure category is included
      const response = await fetch(`${PRODUCT_API_BASE_URL}/${productId}?includeCategoryDetails=true`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Erreur lors de la récupération des détails du produit");
    }
  }
);

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [] as Product[],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => Number(p.id) !== action.payload);
      })
      .addCase(deleteMultipleProducts.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => !action.payload.includes(Number(p.id)));
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (!action.payload || !action.payload.id) return;
        const idx = state.products.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) {
          // Merge all fields except images if not present in payload
          const updated = { ...state.products[idx], ...action.payload };
          if (typeof action.payload.images === "undefined") {
            // preserve previous images if not returned by backend
            updated.images = state.products[idx].images;
          }
          state.products[idx] = updated;
        }
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        // If we got a payload with stripeError flag, don't try to add it to the state
        // since we're reloading the products list anyway
        if (action.payload && !(action.payload.stripeError)) {
          state.products.push(action.payload);
        }
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = { 
            ...state.products[index],
            ...action.payload 
          };
        } else {
          state.products.push(action.payload);
        }
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        const prod = state.products.find(p => Number(p.id) === action.payload.productId);
        if (prod && prod.images) {
          prod.images = prod.images.filter((img: any) => img.id !== action.payload.imageId);
        }
      });
  },
});

export default productSlice.reducer;
