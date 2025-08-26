import apiClient, { ApiError } from '../../api/apiClient'

export type Product = {
  id: string
  name: string
  price: string | number
  category: string
  status: 'active' | 'inactive'
  description?: string
}

export type ProductCreateInput = {
  name: string
  description?: string
  price: string | number
  category: string
  storeId: string
}

export type ProductsQuery = {
  q?: string
  page?: number
  limit?: number
  category?: string
}

export type ProductsResponse = {
  data: Product[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export async function fetchProducts(params: ProductsQuery = {}, storeId?: string): Promise<ProductsResponse> {
  try {
    // Add storeId to params if provided
    const requestParams = storeId ? { ...params, storeId } : params
    
    const res = await apiClient.get<ProductsResponse>('/api/products', { params: requestParams })
    const raw = res.data as any

    // Normalize array response to paginated structure
    const normalized: ProductsResponse = Array.isArray(raw)
      ? {
          data: raw,
          page: 1,
          limit: raw.length ?? 0,
          total: raw.length ?? 0,
          totalPages: 1,
        }
      : raw

    // Basic response validation
    if (!normalized || !Array.isArray(normalized.data)) {
      throw { message: 'Malformed response' } as ApiError
    }
    // Ensure required fields on products
    const valid = normalized.data.every((p: Product) => p && p.id && p.name && p.category && p.status)
    if (!valid) {
      throw { message: 'Malformed product item' } as ApiError
    }
    return normalized
  } catch (err: any) {
    const message = (err && err.message) || 'Failed to load products'
    throw new Error(message)
  }
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  try {
    const res = await apiClient.post<Product>('/api/products', input)
    
    // Basic response validation
    const product = res.data
    if (!product || !product.id || !product.name || !product.category || !product.status) {
      throw { message: 'Malformed product response' } as ApiError
    }
    
    return product
  } catch (err: any) {
    // Re-throw API errors to preserve status codes and messages
    if (err.status && err.message) {
      throw err
    }
    const message = (err && err.message) || 'Failed to create product'
    throw new Error(message)
  }
}
