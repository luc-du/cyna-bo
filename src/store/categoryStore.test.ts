import reducer, {
  fetchCategories,
  searchCategories,
  deleteCategory,
  deleteMultipleCategories,
  fetchCategoryDetails
} from './categoryStore';

describe('categoryStore reducer', () => {
  const initialState = {
    categories: [],
    loading: false,
    error: null,
  };

  const makeCategory = (overrides = {}) => ({
    id: 1,
    name: 'Cat',
    description: 'desc',
    products: [],
    images: [],
    ...overrides,
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle fetchCategories.pending', () => {
    const state = reducer(initialState, { type: fetchCategories.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchCategories.fulfilled', () => {
    const cats = [makeCategory()];
    const state = reducer(initialState, { type: fetchCategories.fulfilled.type, payload: cats });
    expect(state.loading).toBe(false);
    expect(state.categories).toEqual(cats);
  });

  it('should handle fetchCategories.rejected', () => {
    const state = reducer(initialState, { type: fetchCategories.rejected.type, payload: 'err' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('err');
  });

  it('should handle deleteCategory.fulfilled', () => {
    const prevState = { ...initialState, categories: [makeCategory({ id: 1 }), makeCategory({ id: 2 })] };
    const state = reducer(prevState, { type: deleteCategory.fulfilled.type, payload: 1 });
    expect(state.categories.map(c => c.id)).toEqual([2]);
  });

  it('should handle deleteMultipleCategories.fulfilled', () => {
    const prevState = { ...initialState, categories: [makeCategory({ id: 1 }), makeCategory({ id: 2 }), makeCategory({ id: 3 })] };
    const state = reducer(prevState, { type: deleteMultipleCategories.fulfilled.type, payload: [1, 3] });
    expect(state.categories.map(c => c.id)).toEqual([2]);
  });

  it('should handle searchCategories.fulfilled', () => {
    const cats = [makeCategory({ id: 1, name: 'A' }), makeCategory({ id: 2, name: 'B' })];
    const state = reducer(initialState, { type: searchCategories.fulfilled.type, payload: cats });
    expect(state.categories).toEqual(cats);
  });

  it('should handle fetchCategoryDetails.fulfilled', () => {
    const prevState = { ...initialState, categories: [makeCategory({ id: 1, name: 'Old' })] };
    const details = { id: 1, name: 'New' };
    const state = reducer(prevState, { type: fetchCategoryDetails.fulfilled.type, payload: details });
    expect(state.categories[0].name).toBe('New');
  });
});
