import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/index";

// URL de base pour l'authentification
const API_BASE_URL = "/api/v1/auth";
// URL de base pour l'utilisateur
const USER_API_BASE_URL = "/api/v1/user";

/* Signup de user */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        ...userData,
        role: "ADMIN", // Ajoute le rôle ADMIN par défaut
      });
      localStorage.setItem("token", response.data.token);
      console.log("Token reçu (signup) :", response.data.token);
      // Ici, on ne stocke pas le token dans state.user pour forcer la récupération du profil
      return { token: response.data.token };
    } catch (error) {
      if ((error as any).response?.data?.message?.includes("Duplicate entry")) {
        return rejectWithValue("Cet email est déjà utilisé.");
      }
      return rejectWithValue(
        (error as any).response?.data || "Erreur lors de l'inscription"
      );
    }
  }
);

/* Login user */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, userData);
      const token = response.data.token;
      if (!token) {
        throw new Error("Token non reçu");
      }
      localStorage.setItem("token", token);
      console.log("Token stocké (login):", token);
      return { token };
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data || "Email ou mot de passe incorrect !"
      );
    }
  }
);

/* Check du token */
export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token récupéré (validateToken):", token);
      if (!token) {
        throw new Error("Token non disponible");
      }
      const response = await axios.post(
        `${API_BASE_URL}/validate`,
        { token }, // Ici, on envoie le token dans le body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data || "Token invalide");
      }
      return rejectWithValue("Token invalide");
    }
  }
);

/* Récupérer les informations du profil utilisateur */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token récupéré (fetchUserProfile):", token);
      if (!token) {
        throw new Error("Token non disponible");
      }

      // Decode the token to extract the user ID
      const decodedToken: any = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.jti; // Adjust based on your backend's token structure

      if (!userId) {
        throw new Error("User ID non disponible dans le token");
      }

      // Use the user ID in the API call
      const response = await axios.get(`${USER_API_BASE_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du profil utilisateur:",
        error
      );
      return rejectWithValue(
        (error as any).response?.data?.message ||
          "Impossible de récupérer le profil utilisateur"
      );
    }
  }
);

/* Slice */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem("token"), // Initialize based on token presence
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        // state.user reste null afin que fetchUserProfile soit appelé ensuite
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        // Ne pas affecter state.user ici pour forcer la récupération du profil complet
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        if (action.payload.valid) {
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
          localStorage.removeItem("token");
        }
      })
      .addCase(validateToken.rejected, (state) => {
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
        console.log("User data :", state.user);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Profile fetch failed:", action.payload); // Log the error
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
