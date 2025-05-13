import reducer, {
  fetchProducts,
  deleteProduct,
  deleteMultipleProducts,
  updateProduct,
  createProduct,
  deleteProductImage,
  searchProducts,
  fetchProductDetails
} from './productStore';
import { Product } from '../types';

jest.mock('axios');

describe('productStore reducer', () => {
  const initialState = {
    products: [],
    loading: false,
    error: null,
  };

  // Helper for a valid Product
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: '1',
    name: 'Test',
    description: 'desc',
    price: 10,
    category: 'cat',
    status: 'active',
    createdAt: '',
    updatedAt: '',
    images: [],
    ...overrides,
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle fetchProducts.pending', () => {
    const state = reducer(initialState, { type: fetchProducts.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchProducts.fulfilled', () => {
    const products = [makeProduct()];
    const state = reducer(initialState, { type: fetchProducts.fulfilled.type, payload: products });
    expect(state.loading).toBe(false);
    expect(state.products).toEqual(products);
  });

  it('should handle fetchProducts.rejected', () => {
    const state = reducer(initialState, { type: fetchProducts.rejected.type, payload: 'error' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('error');
  });

  it('should handle deleteProduct.fulfilled', () => {
    const prevState = { ...initialState, products: [makeProduct({ id: '1' }), makeProduct({ id: '2' })] };
    const state = reducer(prevState, { type: deleteProduct.fulfilled.type, payload: 1 }); // payload as number
    expect(state.products.map(p => p.id)).toEqual(['2']);
  });

  it('should handle deleteMultipleProducts.fulfilled', () => {
    const prevState = { ...initialState, products: [makeProduct({ id: '1' }), makeProduct({ id: '2' }), makeProduct({ id: '3' })] };
    const state = reducer(prevState, { type: deleteMultipleProducts.fulfilled.type, payload: [1, 3] }); // payload as number[]
    expect(state.products.map(p => p.id)).toEqual(['2']);
  });

  it('should handle updateProduct.fulfilled', () => {
    const prevState = { ...initialState, products: [makeProduct({ id: '1', name: 'Old' })] };
    const updated = { id: '1', name: 'New' };
    const state = reducer(prevState, { type: updateProduct.fulfilled.type, payload: updated });
    expect(state.products[0].name).toBe('New');
  });

  it('should handle createProduct.fulfilled', () => {
    const prevState = { ...initialState, products: [] };
    const newProduct = makeProduct({ id: '1', name: 'Test' });
    const state = reducer(prevState, { type: createProduct.fulfilled.type, payload: newProduct });
    expect(state.products).toContainEqual(newProduct);
  });

  it('should handle searchProducts.fulfilled', () => {
    const products = [makeProduct({ id: '1', name: 'A' }), makeProduct({ id: '2', name: 'B' })];
    const state = reducer(initialState, { type: searchProducts.fulfilled.type, payload: products });
    expect(state.products).toEqual(products);
  });

  it('should handle fetchProductDetails.fulfilled (update existing)', () => {
    const prevState = { ...initialState, products: [makeProduct({ id: '1', name: 'Old' })] };
    const details = { id: '1', name: 'New' };
    const state = reducer(prevState, { type: fetchProductDetails.fulfilled.type, payload: details });
    expect(state.products[0].name).toBe('New');
  });

  it('should handle fetchProductDetails.fulfilled (add new)', () => {
    const prevState = { ...initialState, products: [] };
    const details = makeProduct({ id: '2', name: 'New' });
    const state = reducer(prevState, { type: fetchProductDetails.fulfilled.type, payload: details });
    expect(state.products[0]).toEqual(details);
  });

  it('should handle deleteProductImage.fulfilled', () => {
    const prevState = { ...initialState, products: [makeProduct({ id: '1', images: [{ id: '10', name: '', url: '', uploadDate: '' }, { id: '20', name: '', url: '', uploadDate: '' }] })] };
    const state = reducer(prevState, { type: deleteProductImage.fulfilled.type, payload: { productId: 1, imageId: '10' } }); // productId as number
    expect(state.products[0].images.map(img => img.id)).toEqual(['20']);
  });
});
