import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const USER_API_BASE_URL = "/api/v1/user";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non disponible");
      }
      const response = await axios.get(USER_API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data ||
          "Erreur lors de la récupération des utilisateurs"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(USER_API_BASE_URL, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data ||
          "Erreur lors de la création de l'utilisateur"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { id, userData }: { id: number; userData: any },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${USER_API_BASE_URL}/${id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data ||
          "Erreur lors de la mise à jour de l'utilisateur"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Pour vérifier que le token est récupéré
      if (!token) {
        throw new Error("Token non disponible");
      }
      // Vérifiez que le header est bien formatté en "Bearer <token>"
      const response = await axios.delete(`${USER_API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      return rejectWithValue(
        (error as any).response?.data ||
          "Erreur lors de la suppression de l'utilisateur"
      );
    }
  }
);

interface UserState {
  users: Array<any>;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
