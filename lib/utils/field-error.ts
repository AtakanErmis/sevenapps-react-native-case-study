import { AnyFieldApi } from '@tanstack/react-form';

export function fieldError(field: AnyFieldApi) {
  return !field.state.meta.isValid && field.state.meta.isTouched
    ? field.state.meta.errors.map((err) => err.message).join(',')
    : undefined;
}

export function fieldHasError(field: AnyFieldApi) {
  return !field.state.meta.isValid && field.state.meta.isTouched;
}
