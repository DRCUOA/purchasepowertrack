import { ref } from 'vue';
import { ApiClientError } from '../api/client';
export function useApiError() {
    const errorMessage = ref(null);
    let retryFn = null;
    function handleError(err) {
        if (err instanceof ApiClientError) {
            errorMessage.value = err.message;
        }
        else if (err instanceof Error) {
            errorMessage.value = err.message;
        }
        else {
            errorMessage.value = 'An unexpected error occurred';
        }
    }
    function setRetry(fn) {
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
//# sourceMappingURL=useApiError.js.map