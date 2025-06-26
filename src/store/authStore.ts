import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../types/index";
import { AUTH_API_URL, USER_API_URL } from "../lib/constants";
import { CustomAxiosError, DecodedToken, AuthResponse } from "../types/api";

/* User signup */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
 //     captchaToken?: string; // Captcha token
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_API_URL}/signup`, {
        ...userData,
        role: "ADMIN", // Default role is ADMIN
      });
      localStorage.setItem("token", response.data.token);
      return { token: response.data.token };
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      if (axiosError.response?.data?.message?.includes("Duplicate entry")) {
        return rejectWithValue("This email is already used.");
      }
      return rejectWithValue(
        axiosError.response?.data?.message || "Error during registration"
      );
    }
  }
);

/* User login */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    userData: { email: string; password: string;}, //captchaToken?: string }, // Captcha token
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_API_URL}/signin`, userData);
      const token = response.data.token;
      if (!token) {
        throw new Error("Token not received");
      }
      localStorage.setItem("token", token);
      return { token };
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      
      if (axiosError.response?.status === 401) {
        return rejectWithValue("Email ou mot de passe incorrect");
      } else if (axiosError.response?.status === 403) {
        return rejectWithValue("Accès refusé. Vous n'avez pas les autorisations nécessaires.");
      } else if (axiosError.response?.status === 400 && axiosError.response.data?.message?.includes("captcha")) {
        return rejectWithValue("Validation du captcha échouée. Veuillez réessayer.");
      }
      
      return rejectWithValue(
        axiosError.response?.data?.message || "Erreur lors de la connexion. Veuillez réessayer."
      );
    }
  }
);

/* Token validation */
export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      // Avoid logging tokens in production
      if (!token) {
        throw new Error("Token not available");
      }
      const response = await axios.post(
        `${AUTH_API_URL}/validate`,
        { token },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data || "Invalid token");
      }
      return rejectWithValue("Invalid token");
    }
  }
);

/* Fetch user profile information */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("Missing token, please reconnect.");
    }
    try {
      // Décoder le token de manière plus sécurisée
      const parts = token.split(".");
      if (parts.length !== 3) {
        return rejectWithValue("Invalid token format");
      }
      
      try {
        const decodedToken = JSON.parse(atob(parts[1])) as DecodedToken;
        const userId = decodedToken.jti;

        if (!userId) {
          return rejectWithValue("User ID not available in token");
        }

        const response = await axios.get<User>(`${USER_API_URL}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
      } catch (parseError) {
        return rejectWithValue("Unable to parse token");
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      return rejectWithValue(
        axiosError.response?.data?.message || "Unable to fetch user profile"
      );
    }
  }
);

/* Auth slice */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem("token"),
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
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
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
        // console.log("User data :", state.user);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // console.error("Profile fetch failed:", action.payload);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
