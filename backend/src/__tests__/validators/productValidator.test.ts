import { validateProductCreate, validateProductUpdate, validateProductQuery } from '../../validators/productValidator'

function expectValidation(fn: () => any) {
  try {
    fn()
    throw new Error('Expected validation error')
  } catch (e: any) {
    expect(e).toBeInstanceOf(Error)
    expect(e.code).toBe('VALIDATION_ERROR')
    return e
  }
}

describe('productValidator', () => {
  describe('validateProductCreate', () => {
    const base = {
      storeId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Apple',
      description: 'Fresh',
      price: '1.50',
      category: 'Fruit',
    }

    test('valid input passes', () => {
      const out = validateProductCreate(base)
      expect(out).toMatchObject({ name: 'Apple', price: '1.50' })
    })

    test('missing required triggers VALIDATION_ERROR', () => {
      expectValidation(() => validateProductCreate({}))
    })

    test('invalid uuid fails', () => {
      expectValidation(() => validateProductCreate({ ...base, storeId: 'not-a-uuid' }))
    })

    test('price must be positive decimal up to 2 places', () => {
      expectValidation(() => validateProductCreate({ ...base, price: '0' }))
      expectValidation(() => validateProductCreate({ ...base, price: '-1' }))
      expectValidation(() => validateProductCreate({ ...base, price: '1.234' }))
      expectValidation(() => validateProductCreate({ ...base, price: 'abc' }))
    })

    test('name too short fails', () => {
      expectValidation(() => validateProductCreate({ ...base, name: 'A' }))
    })

    test('category required', () => {
      const bad: any = { ...base }
      delete bad.category
      expectValidation(() => validateProductCreate(bad))
    })
  })

  describe('validateProductUpdate', () => {
    test('partial update allowed', () => {
      const out = validateProductUpdate({ name: 'Orange' })
      expect(out).toMatchObject({ name: 'Orange' })
    })

    test('invalid price format fails', () => {
      expectValidation(() => validateProductUpdate({ price: '1.234' }))
    })

    test('invalid status fails', () => {
      expectValidation(() => validateProductUpdate({ status: 'deleted' as any }))
    })

    test('unknown fields rejected due to strict schema', () => {
      expectValidation(() => validateProductUpdate({ foo: 'bar' } as any))
    })
  })

  describe('validateProductQuery', () => {
    test('valid query coerces page/limit and enforces bounds', () => {
      const out = validateProductQuery({ page: '2', limit: '10', q: 'app', storeId: '550e8400-e29b-41d4-a716-446655440000' })
      expect(out).toMatchObject({ page: 2, limit: 10, q: 'app' })
    })

    test('defaults page=1, limit=10', () => {
      const out = validateProductQuery({})
      expect(out.page).toBe(1)
      expect(out.limit).toBe(10)
    })

    test('invalid page/limit and storeId cause VALIDATION_ERROR', () => {
      expectValidation(() => validateProductQuery({ page: 0 }))
      expectValidation(() => validateProductQuery({ limit: 100 }))
      expectValidation(() => validateProductQuery({ storeId: 'bad-uuid' }))
    })

    test('empty q is invalid (min 1)', () => {
      expectValidation(() => validateProductQuery({ q: '' }))
    })
  })
})
