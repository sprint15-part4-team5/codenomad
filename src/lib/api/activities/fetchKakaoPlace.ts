import kakaoMapsClient from '../kakaoMapsClient';

export interface Place {
  lat: number;
  lng: number;
  title: string | null;
  url: string;
}

const DEFAULT_URL = '/search/address.json?query=';

export const DEFAULT_PLACE: Place = {
  lat: 37.566826, // 서울시청
  lng: 126.9786567,
  title: '주소를 불러오지 못했습니다.',
  url: `https://map.kakao.com/link/map/${encodeURIComponent('서울 중구 세종대로 110')},37.566826,126.9786567`,
};

export const fetchKakaoPlace = async (query: string): Promise<Place | null> => {
  const trimmedQuery = query.replace(/\s\d+(-\d+)?$/g, '').trim();

  const trySearch = async (q: string): Promise<Place | null> => {
    const encodedQuery = encodeURIComponent(q.trim());
    try {
      const res = await kakaoMapsClient.get(DEFAULT_URL + encodedQuery);
      const docs = res.data.documents;

      if (!Array.isArray(docs) || docs.length === 0) return null;

      const found = docs[0];
      const target = found.road_address ?? found.address;
      if (!target) return null;

      const lat = Number(target.y);
      const lng = Number(target.x);
      const title = target.address_name ?? null;

      return {
        lat,
        lng,
        title,
        url: `https://map.kakao.com/link/map/${encodeURIComponent(title)},${lat},${lng}`,
      };
    } catch {
      throw new Error('카카오맵 API 요청 실패');
    }
  };
  const result = await trySearch(query);
  if (result) return result;

  const fallbackResult = await trySearch(trimmedQuery);
  return fallbackResult ?? DEFAULT_PLACE;
};
