'use client'

import { Check, X, AlertCircle, Loader2 } from 'lucide-react'
import React, { useState, useCallback } from 'react'

import { createProduct, ProductCreateInput } from '../../lib/api/products'
import { Input } from '../../src/components/ui/input'
import { useAppSelector } from '../../src/store/hooks'
import { selectCurrentStore } from '../../src/store/slices/storeSlice'

import Button from './Button'

export type ProductFormProps = {
  onSuccess?: (product: any) => void
  onCancel?: () => void
  className?: string
}

type FormData = {
  name: string
  description: string
  price: string
  category: string
}

type FormErrors = {
  [key in keyof FormData]?: string
} & {
  general?: string
}

const initialFormData: FormData = {
  name: '',
  description: '',
  price: '',
  category: '',
}

const COMMON_CATEGORIES = [
  'Food & Beverages',
  'Electronics',
  'Clothing & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Recreation',
  'Books & Media',
  'Toys & Games',
  'Automotive',
  'Other'
]

export default function ProductForm({ onSuccess, onCancel, className = '' }: ProductFormProps) {
  const currentStore = useAppSelector(selectCurrentStore)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateField = useCallback((name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Product name is required'
        if (value.trim().length < 2) return 'Product name must be at least 2 characters'
        if (value.trim().length > 255) return 'Product name must be at most 255 characters'
        break
      
      case 'price':
        if (!value.trim()) return 'Price is required'
        const priceRegex = /^\d+(\.\d{1,2})?$/
        if (!priceRegex.test(value)) return 'Price must be a valid number with up to 2 decimal places'
        const numPrice = parseFloat(value)
        if (numPrice <= 0) return 'Price must be greater than 0'
        if (numPrice > 999999.99) return 'Price must be less than $1,000,000'
        break
      
      case 'category':
        if (!value.trim()) return 'Category is required'
        if (value.trim().length > 100) return 'Category must be at most 100 characters'
        break
      
      case 'description':
        if (value.length > 1000) return 'Description must be at most 1000 characters'
        break
    }
    return undefined
  }, [])

  const validateForm = useCallback((data: FormData): FormErrors => {
    const errors: FormErrors = {}
    
    Object.keys(data).forEach((key) => {
      const fieldKey = key as keyof FormData
      const error = validateField(fieldKey, data[fieldKey])
      if (error) {
        errors[fieldKey] = error
      }
    })
    
    return errors
  }, [validateField])

  const handleInputChange = useCallback((name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear general error on any change
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }, [errors])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    // Validate form
    const formErrors = validateForm(formData)
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    // Check if store is selected
    if (!currentStore) {
      setErrors({ general: 'Please select a store first' })
      return
    }

    setIsSubmitting(true)
    setErrors({})
    
    try {
      const input: ProductCreateInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price,
        category: formData.category.trim(),
        storeId: currentStore.id,
      }
      
      const product = await createProduct(input)
      
      // Show success state
      setSubmitSuccess(true)
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData(initialFormData)
        setSubmitSuccess(false)
        if (onSuccess) {
          onSuccess(product)
        }
      }, 1500)
      
    } catch (err: any) {
      setSubmitSuccess(false)
      
      // Handle specific API errors
      if (err.status === 400) {
        if (err.details) {
          // Map validation errors to form fields
          const apiErrors: FormErrors = {}
          if (err.details.fieldErrors?.name) {
            apiErrors.name = err.details.fieldErrors.name[0]
          }
          if (err.details.fieldErrors?.price) {
            apiErrors.price = err.details.fieldErrors.price[0]
          }
          if (err.details.fieldErrors?.category) {
            apiErrors.category = err.details.fieldErrors.category[0]
          }
          if (err.details.fieldErrors?.description) {
            apiErrors.description = err.details.fieldErrors.description[0]
          }
          setErrors(apiErrors)
        } else {
          setErrors({ general: err.message || 'Invalid input data' })
        }
      } else if (err.status === 409) {
        setErrors({ name: 'A product with this name already exists in the store' })
      } else if (err.status === 403) {
        setErrors({ general: 'You do not have permission to create products' })
      } else if (err.status === 401) {
        setErrors({ general: 'Please log in to create products' })
      } else {
        setErrors({ general: err.message || 'Failed to create product. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, validateForm, currentStore, onSuccess])

  const handleReset = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
    setSubmitSuccess(false)
  }, [])

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
        <p className="text-sm text-gray-600 mt-1">Create a new product for your store inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <Input
            id="product-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
            className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
            autoComplete="off"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-2">
            Price ($) *
          </label>
          <Input
            id="product-price"
            type="text"
            inputMode="decimal"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
            className={errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={isSubmitting}
            autoComplete="off"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.price}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="relative">
            <select
              id="product-category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-input'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a category</option>
              {COMMON_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.category}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            You can also type a custom category name
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="product-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter product description (optional)"
            rows={3}
            className={`w-full px-3 py-2 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-ring disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-input'
            }`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errors.general}
            </p>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0" />
              Product created successfully!
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="flex-1 sm:flex-none sm:min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : submitSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Created
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isSubmitting || submitSuccess}
          >
            Reset
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}