import kakaoMapsClient from './kakaoMapsClient';

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

// 주소를 좌표로 변환하는 API 호출
export const geocodeAddress = async (
  address: string,
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await kakaoMapsClient.get<KakaoGeocoderResponse>('/search/address.json', {
      params: {
        query: address,
      },
    });

    const data = response.data;

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

// 좌표를 주소로 변환하는 API 호출
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await kakaoMapsClient.get<KakaoGeocoderResponse>('/geo/coord2address.json', {
      params: {
        x: lng,
        y: lat,
      },
    });

    const data = response.data;

    if (data.documents && data.documents.length > 0) {
      return data.documents[0].address_name;
    }

    return null;
  } catch (error) {
    console.error('좌표를 주소로 변환하는 중 오류가 발생했습니다:', error);
    return null;
  }
};
