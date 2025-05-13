import reducer, {
  registerUser,
  loginUser,
  validateToken,
  fetchUserProfile
} from './authStore';
import type { User } from '../types';

describe('authStore reducer', () => {
  const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };

  const makeUser = (overrides: Partial<User> = {}): User => ({
    id: '1',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    role: 'ADMIN',
    password: 'password',
    ...overrides,
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle registerUser.pending', () => {
    const state = reducer(initialState, { type: registerUser.pending.type });
    // The reducer does not set loading=true for registerUser.pending
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle registerUser.fulfilled', () => {
    const state = reducer(initialState, { type: registerUser.fulfilled.type, payload: { token: 'abc' } });
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle registerUser.rejected', () => {
    const state = reducer(initialState, { type: registerUser.rejected.type, payload: 'error' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('error');
  });

  it('should handle loginUser.fulfilled', () => {
    const state = reducer(initialState, { type: loginUser.fulfilled.type, payload: { token: 'abc' } });
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle loginUser.rejected', () => {
    const state = reducer(initialState, { type: loginUser.rejected.type, payload: 'bad login' });
    expect(state.error).toBe('bad login');
  });

  it('should handle validateToken.fulfilled', () => {
    const state = reducer(initialState, { type: validateToken.fulfilled.type, payload: { valid: true } });
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle validateToken.rejected', () => {
    const state = reducer(initialState, { type: validateToken.rejected.type });
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle fetchUserProfile.fulfilled', () => {
    const user = makeUser();
    const state = reducer(initialState, { type: fetchUserProfile.fulfilled.type, payload: user });
    expect(state.user).toEqual(user);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});
