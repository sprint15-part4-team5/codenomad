import axios from 'axios';

const kakaoMapsClient = axios.create({
  baseURL: 'https://dapi.kakao.com/v2/local',
  headers: {
    Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
  },
});

// 요청 인터셉터에서 카카오 API 키 추가
kakaoMapsClient.interceptors.request.use(
  (config) => {
    const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    if (REST_API_KEY) {
      config.headers.Authorization = `KakaoAK ${REST_API_KEY}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default kakaoMapsClient;
