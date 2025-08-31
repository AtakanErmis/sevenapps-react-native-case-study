import { AnyFieldApi } from '@tanstack/react-form';

import { fieldError, fieldHasError } from '@/lib/utils/field-error';

// Mock field API factory function
const createMockField = (overrides: any = {}): AnyFieldApi => {
  const defaultField = {
    state: {
      meta: {
        isValid: true,
        isTouched: false,
        errors: [],
      },
    },
  };

  return {
    ...defaultField,
    ...overrides,
    state: {
      ...defaultField.state,
      ...overrides.state,
      meta: {
        ...defaultField.state.meta,
        ...overrides.state?.meta,
      },
    },
  } as AnyFieldApi;
};

describe('fieldError', () => {
  it('returns undefined when field is valid and touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: true,
          isTouched: true,
          errors: [],
        },
      },
    });

    expect(fieldError(field)).toBeUndefined();
  });

  it('returns undefined when field is invalid but not touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: false,
          errors: [{ message: 'Required field' }],
        },
      },
    });

    expect(fieldError(field)).toBeUndefined();
  });

  it('returns undefined when field is valid and not touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: true,
          isTouched: false,
          errors: [],
        },
      },
    });

    expect(fieldError(field)).toBeUndefined();
  });

  it('returns error message when field is invalid and touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [{ message: 'This field is required' }],
        },
      },
    });

    expect(fieldError(field)).toBe('This field is required');
  });

  it('returns joined error messages when field has multiple errors', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [
            { message: 'This field is required' },
            { message: 'Must be at least 3 characters' },
            { message: 'Cannot contain special characters' },
          ],
        },
      },
    });

    expect(fieldError(field)).toBe(
      'This field is required,Must be at least 3 characters,Cannot contain special characters'
    );
  });

  it('handles empty error array when invalid and touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [],
        },
      },
    });

    expect(fieldError(field)).toBe('');
  });

  it('handles error objects without message property', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [
            { message: 'Valid error' },
            { code: 'INVALID', description: 'No message property' } as any,
          ],
        },
      },
    });

    // When an error object doesn't have a message property, it returns undefined
    // which gets converted to empty string when joined
    expect(fieldError(field)).toBe('Valid error,');
  });
});

describe('fieldHasError', () => {
  it('returns false when field is valid and touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: true,
          isTouched: true,
          errors: [],
        },
      },
    });

    expect(fieldHasError(field)).toBe(false);
  });

  it('returns false when field is invalid but not touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: false,
          errors: [{ message: 'Required field' }],
        },
      },
    });

    expect(fieldHasError(field)).toBe(false);
  });

  it('returns false when field is valid and not touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: true,
          isTouched: false,
          errors: [],
        },
      },
    });

    expect(fieldHasError(field)).toBe(false);
  });

  it('returns true when field is invalid and touched', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [{ message: 'This field is required' }],
        },
      },
    });

    expect(fieldHasError(field)).toBe(true);
  });

  it('returns true when field is invalid and touched with multiple errors', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [
            { message: 'This field is required' },
            { message: 'Must be at least 3 characters' },
          ],
        },
      },
    });

    expect(fieldHasError(field)).toBe(true);
  });

  it('returns true when field is invalid and touched even with empty errors array', () => {
    const field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [],
        },
      },
    });

    expect(fieldHasError(field)).toBe(true);
  });
});

describe('integration scenarios', () => {
  it('handles typical form validation workflow', () => {
    // Initial state - field not touched, no errors
    let field = createMockField();
    expect(fieldHasError(field)).toBe(false);
    expect(fieldError(field)).toBeUndefined();

    // User focuses field but doesn't enter anything - still not touched
    field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: false,
          errors: [{ message: 'This field is required' }],
        },
      },
    });
    expect(fieldHasError(field)).toBe(false);
    expect(fieldError(field)).toBeUndefined();

    // User blurs field without entering valid data - now touched and invalid
    field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [{ message: 'This field is required' }],
        },
      },
    });
    expect(fieldHasError(field)).toBe(true);
    expect(fieldError(field)).toBe('This field is required');

    // User enters valid data - now touched and valid
    field = createMockField({
      state: {
        meta: {
          isValid: true,
          isTouched: true,
          errors: [],
        },
      },
    });
    expect(fieldHasError(field)).toBe(false);
    expect(fieldError(field)).toBeUndefined();
  });

  it('handles progressive validation with multiple errors', () => {
    // User enters too short text
    let field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [{ message: 'Must be at least 3 characters' }],
        },
      },
    });
    expect(fieldHasError(field)).toBe(true);
    expect(fieldError(field)).toBe('Must be at least 3 characters');

    // User enters text with special characters (multiple validation errors)
    field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [
            { message: 'Must be at least 3 characters' },
            { message: 'Cannot contain special characters' },
          ],
        },
      },
    });
    expect(fieldHasError(field)).toBe(true);
    expect(fieldError(field)).toBe(
      'Must be at least 3 characters,Cannot contain special characters'
    );

    // User fixes one error but still has another
    field = createMockField({
      state: {
        meta: {
          isValid: false,
          isTouched: true,
          errors: [{ message: 'Cannot contain special characters' }],
        },
      },
    });
    expect(fieldHasError(field)).toBe(true);
    expect(fieldError(field)).toBe('Cannot contain special characters');
  });
});
