// 카카오맵 API 유틸리티 함수

interface KakaoGeocoderResult {
  address_name: string;
  address_type: string;
  x: string; // 경도
  y: string; // 위도
  address: {
    address_name: string;
    b_code: string;
    h_code: string;
    main_address_no: string;
    mountain_yn: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    sub_address_no: string;
    x: string;
    y: string;
  };
}

interface KakaoGeocoderResponse {
  documents: KakaoGeocoderResult[];
  meta: {
    is_end: boolean;
    pageable_count: number;
    total_count: number;
  };
}

// 주소를 좌표로 변환하는 함수
export const addressToCoordinate = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  
  if (!REST_API_KEY) {
    console.error('카카오 REST API 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: KakaoGeocoderResponse = await response.json();

    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0];
      return {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      };
    }

    return null;
  } catch (error) {
    console.error('주소를 좌표로 변환하는 중 오류가 발생했습니다:', error);
    return null;
  }
};

// 좌표를 주소로 변환하는 함수 (필요시 사용)
export const coordinateToAddress = async (lat: number, lng: number): Promise<string | null> => {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  
  if (!REST_API_KEY) {
    console.error('카카오 REST API 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: KakaoGeocoderResponse = await response.json();

    if (data.documents && data.documents.length > 0) {
      return data.documents[0].address_name;
    }

    return null;
  } catch (error) {
    console.error('좌표를 주소로 변환하는 중 오류가 발생했습니다:', error);
    return null;
  }
};
