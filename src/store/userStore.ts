
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const USER_API_BASE_URL = "/api/v1/user";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(USER_API_BASE_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch {
    return rejectWithValue("Erreur lors de la récupération des utilisateurs");
  }
});

export const searchUsers = createAsyncThunk("users/searchUsers", async (name: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${USER_API_BASE_URL}/search?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch {
    return rejectWithValue("Erreur lors de la recherche d'utilisateurs.");
  }
});

export const createUser = createAsyncThunk("users/createUser", async (userData: any, { rejectWithValue }) => {
  try {
    const response = await axios.post(USER_API_BASE_URL, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch {
    return rejectWithValue("Erreur lors de la création de l'utilisateur");
  }
});

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }: { id: number; userData: any }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${USER_API_BASE_URL}/${id}`, userData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur PATCH :", error);
      return rejectWithValue("Erreur lors de la mise à jour de l'utilisateur");
    }
  }
);


export const deleteUser = createAsyncThunk("users/deleteUser", async (id: number, { rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(); 
    await axios.delete(`${USER_API_BASE_URL}/${id}`, { headers });
    return id;
  } catch (error: any) {
    const message = error?.response?.data || error?.message || "Erreur inconnue";
    console.error("Erreur DELETE :", message);
    return rejectWithValue(message);
  }
});



const userSlice = createSlice({
  name: "users",
  initialState: { users: [] as Array<{ id: number; [key: string]: any }>, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.users = action.payload; })
      .addCase(createUser.fulfilled, (state, action) => { state.users.push(action.payload as { id: number; [key: string]: any }); })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
