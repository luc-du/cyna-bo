import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "../types";
import { normalizeProductImages } from "../utils/imageUtils";

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
      
      // Normaliser les images des produits
      const normalizedProducts = data.map((product: any) => {
        return normalizeProductImages({
          ...product,
          category: product.category || null,
        });
      });
      
      return normalizedProducts;
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
      
      return normalizeProductImages(response.data);
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
  async ({ id, data }: { id: number; data: FormData }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      const hasImages = data.getAll("images").length > 0;

      
      // 1. Upload new images uniquement si présentes
      if (hasImages) {
        const imageFormData = new FormData();
        const images = data.getAll("images");
        images.forEach(image => {
          imageFormData.append("images", image);
        });

        const imageResponse = await fetch(`${PRODUCT_API_BASE_URL}/${id}/images`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: imageFormData
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          return rejectWithValue(`Image upload failed: ${errorText}`);
        }
      }

      // 2. Mettre à jour les autres champs du produit (sans images)
      const productFormData = new FormData();
      for (const [key, value] of data.entries()) {
        if (key !== "images") {
          productFormData.append(key, value);
        }
      }
      productFormData.append("id", String(id));

      // N'envoyer le PATCH produit que si au moins un champ utile est modifié
      if ([...productFormData.keys()].length > 1) { // il y a au moins un champ autre que id
        const response = await fetch(PRODUCT_API_BASE_URL, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: productFormData
        });

        if (!response.ok) {
          const errorText = await response.text();

          return rejectWithValue(`Product update failed: ${errorText}`);
        }
      }


      const updatedProduct = await dispatch(fetchProductById(id)).unwrap();
      return updatedProduct;
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
      if (!token) throw new Error("No token found");
      
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

      if (!response.ok) {

        if (responseText.includes("Product already exists") ||
            responseText.includes("stripe") ||
            responseText.includes("subscription")) {

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
        newProduct = { message: responseText };
      }

      if (newProduct && newProduct.id) {
        const fullProduct = await dispatch(fetchProductById(newProduct.id)).unwrap();
        await dispatch(fetchProducts());
        return fullProduct;
      }

      await dispatch(fetchProducts());
      return newProduct;
    } catch (error) {

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
        data: { imageId },
      });
      return { productId, imageId };
    } catch (error) {
      return rejectWithValue("Erreur lors de la suppression de l'image");
    }
  }
);

export const searchProducts = createAsyncThunk("products/searchProducts", async (name: string, { rejectWithValue, dispatch }) => {
  try {
    if (name.length < 3) {
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
    
    const response = await fetch(`${PRODUCT_API_BASE_URL}/search?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      
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
        
        // Ensure type compatibility with Redux state
        state.products = action.payload as Product[];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        if (action.payload !== undefined) {
          state.products = state.products.filter((p) => Number(p.id) !== Number(action.payload));
        }
      })
      .addCase(deleteMultipleProducts.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          const productIdsToRemove = action.payload.map(id => Number(id));
          state.products = state.products.filter((p) => !productIdsToRemove.includes(Number(p.id)));
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (!action.payload || typeof action.payload.id === 'undefined') return;
        
        // Create a properly typed object that meets Product requirements
        const idx = state.products.findIndex(p => Number(p.id) === Number(action.payload.id));
        if (idx !== -1) {
          // Create a new object with validated image types
          const validatedProduct = {
            ...state.products[idx],
            ...action.payload
          };
          
          // Keep existing images if not provided in payload
          if (typeof action.payload.images === 'undefined' || !Array.isArray(action.payload.images)) {
            validatedProduct.images = state.products[idx].images;
          } else {
            // Ensure each image has a valid id string (not undefined)
            validatedProduct.images = action.payload.images.map(img => ({
              ...img,
              id: String(img.id || "")
            }));
          }
          
          // Type assertion to satisfy TypeScript
          state.products[idx] = validatedProduct as any as Product;
        }
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        if (action.payload && typeof action.payload === 'object' && !action.payload.stripeError) {
          // Ensure images have proper id type
          const product = {
            ...action.payload,
            images: Array.isArray(action.payload.images) 
              ? action.payload.images.map((img: any) => ({
                  ...img,
                  id: img.id?.toString() || "" // Ensure id is always a string
                }))
              : []
          };
          state.products.push(product);
        }
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload)) {
          // Fix image id types in search results
          state.products = action.payload.map((product: any) => ({
            ...product,
            images: Array.isArray(product.images)
              ? product.images.map((img: any) => ({
                  ...img,
                  id: img.id?.toString() || ""
                }))
              : []
          }));
        } else {
          state.products = [];
        }
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        if (!action.payload || typeof action.payload.id === 'undefined') return;
        
        // Fix image types
        const fixedPayload = {
          ...action.payload,
          images: Array.isArray(action.payload.images) 
            ? action.payload.images.map((img: any) => ({
                ...img,
                id: img.id?.toString() || ""
              }))
            : []
        };
        
        const index = state.products.findIndex(p => Number(p.id) === Number(action.payload.id));
        if (index !== -1) {
          state.products[index] = { 
            ...state.products[index],
            ...fixedPayload
          };
        } else {
          state.products.push(fixedPayload);
        }
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        if (!action.payload || typeof action.payload.productId === 'undefined') return;
        
        const prod = state.products.find(p => Number(p.id) === Number(action.payload.productId));
        if (prod && prod.images) {
          prod.images = prod.images.filter((img: any) => img.id !== action.payload.imageId);
        }
      });
  },
});

export default productSlice.reducer;

