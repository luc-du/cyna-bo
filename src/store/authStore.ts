import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/index";

// Auth API base URL
const API_BASE_URL = "/api/v1/auth";
// User API base URL
const USER_API_BASE_URL = "/api/v1/user";

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
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        ...userData,
        role: "ADMIN", // Default role is ADMIN
      });
      localStorage.setItem("token", response.data.token);
      // Avoid logging tokens in production
      // console.log("Token received (signup):", response.data.token);
      return { token: response.data.token };
    } catch (error) {
      if ((error as any).response?.data?.message?.includes("Duplicate entry")) {
        return rejectWithValue("This email is already used.");
      }
      return rejectWithValue(
        (error as any).response?.data || "Error during registration"
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
      const response = await axios.post(`${API_BASE_URL}/signin`, userData);
      const token = response.data.token;
      if (!token) {
        throw new Error("Token not received");
      }
      localStorage.setItem("token", token);
      // Avoid logging tokens in production
      // console.log("Token stored (login):", token);
      return { token };
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data || "Incorrect email or password!"
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
      // console.log("Token retrieved (validateToken):", token);
      if (!token) {
        throw new Error("Token not available");
      }
      const response = await axios.post(
        `${API_BASE_URL}/validate`,
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
      // Don't log, don't try to decode, just reject
      return rejectWithValue("Missing token, please reconnect.");
    }
    try {
      const decodedToken: any = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.jti; 

      if (!userId) {
        return rejectWithValue("User ID not available in token");
      }

      const response = await axios.get(`${USER_API_BASE_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        error
      );
      return rejectWithValue(
        (error as any).response?.data?.message ||
          "Unable to fetch user profile"
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
