import axios from 'axios';
import { toast } from 'sonner';

interface ShowToastErrorOptions {
  fallback?: string;
  overrides?: Record<number, string>;
}

const showToastError = (err?: unknown, options: ShowToastErrorOptions = {}) => {
  const { fallback = '오류가 발생했습니다.', overrides = {} } = options;

  // 문자열만 넘어올 경우
  if (typeof err === 'string') {
    toast.error(err);
    return;
  }

  // Axios 에러일 경우
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const serverMessage = err.response?.data?.message;

    const overrideMessage = status && overrides[status];
    toast.error(overrideMessage ?? serverMessage ?? fallback);
    return;
  }

  // 일반 JS 에러 객체일 경우
  if (err instanceof Error) {
    toast.error(err.message || fallback);
    return;
  }

  // 그 외
  toast.error(fallback);
};

export default showToastError;
