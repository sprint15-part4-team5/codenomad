'use client';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import useKakaoLoader from '@/hooks/useKakaoLoder';
import { useEffect, useState } from 'react';
import { fetchKakaoPlace, DEFAULT_PLACE } from '@/lib/api/activities/fetchKakaoPlace';
import type { Place } from '@/lib/api/activities/fetchKakaoPlace';
import Link from 'next/link';
import Image from 'next/image';

interface MapViewProps {
  address: string;
  category: string;
}

const MapView = ({ address, category }: MapViewProps) => {
  useKakaoLoader();
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);

  const categoryIconMap: Record<string, string> = {
    '문화 · 예술': '/icons/icon_art.svg',
    식음료: '/icons/icon_food.svg',
    스포츠: '/icons/icon_sport.svg',
    투어: '/icons/icon_tour.svg',
    관광: '/icons/icon_bus.svg',
    웰빙: '/icons/icon_wellbeing.svg',
  };

  useEffect(() => {
    const loadPlace = async () => {
      const placeData = await fetchKakaoPlace(address);
      if (placeData) setPlace(placeData);
    };
    loadPlace();
  }, [address]);

  return (
    <div className='mb-20 h-300 w-auto overflow-hidden rounded-2xl md:h-400'>
      <Map
        center={{ lat: place.lat, lng: place.lng }}
        style={{ width: '100%', height: '100%', zIndex: '0' }}
        level={2}
      >
        <MapMarker
          position={{ lat: place.lat, lng: place.lng }}
          image={{
            src: '/icons/icon_map_marker.svg', // 마커이미지의 주소입니다
            size: {
              width: 40,
              height: 60,
            }, // 마커이미지의 크기입니다
          }}
        />
        <CustomOverlayMap position={{ lat: place.lat, lng: place.lng }} yAnchor={1}>
          <div className='border-primary-500 relative bottom-60 flex h-40 w-auto items-center rounded-3xl border-2 bg-white p-10 shadow-md'>
            <Link href={place.url} target='_blank'>
              <span className='text-14-m text-gray-950'>{place.title}</span>
            </Link>
            <div className='absolute bottom-30 left-0 flex h-30 w-30 items-center justify-center rounded-full bg-white shadow-md'>
              <Image src={categoryIconMap[category]} alt={category} width={20} height={20} />
            </div>
          </div>
        </CustomOverlayMap>
      </Map>
    </div>
  );
};

export default MapView;
