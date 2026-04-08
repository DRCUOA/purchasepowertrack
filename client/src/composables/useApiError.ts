import { ref } from 'vue';
import { ApiClientError } from '../api/client';

export function useApiError() {
  const errorMessage = ref<string | null>(null);
  let retryFn: (() => void) | null = null;

  function handleError(err: unknown) {
    if (err instanceof ApiClientError) {
      errorMessage.value = err.message;
    } else if (err instanceof Error) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'An unexpected error occurred';
    }
  }

  function setRetry(fn: () => void) {
    retryFn = fn;
  }

  function retry() {
    if (retryFn) {
      clearError();
      retryFn();
    }
  }

  function clearError() {
    errorMessage.value = null;
  }

  return { errorMessage, handleError, setRetry, retry, clearError };
}
