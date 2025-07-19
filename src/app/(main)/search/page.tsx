'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from '@/lib/api/axios';
import type { Activity } from '@/components/landing/LandingCard';
import LandingCard from '@/components/landing/LandingCard';
import Pagination from '@/components/common/Pagination';
import NoResult from '@/components/search/NoResult';
import Banner from '@/components/landing/Banner';
import SearchBar from '@/components/landing/SearchBar';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const page = Number(searchParams.get('page')) || 1;
  const size = 8;
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get(`/activities`, {
          params: {
            method: 'offset',
            keyword,
            page,
            size,
          },
        });

        setActivities(res.data.activities);
        setTotalCount(res.data.totalCount);
      } catch (err) {
        console.error('검색 결과 요청 실패', err);
      }
    };

    fetchActivities();
  }, [keyword, page]);

  const totalPages = Math.ceil(totalCount / size);

  return (
    <main className='min-h-screen w-full px-20'>
      <div className='mx-auto max-w-screen-xl'>
        {/* 배너 & 검색바 */}
        <Banner />
        <SearchBar />

        {/* 검색 결과 안내 텍스트 */}
        <div className='text-20-b mt-40 mb-10'>‘{keyword}’에 대한 검색 결과입니다.</div>
        {totalCount > 0 && <div className='text-14-m text-gray-400'>총 {totalCount}개의 결과</div>}
        {/* 결과 리스트 */}
        {activities.length === 0 ? (
          <NoResult />
        ) : (
          <>
            <section className='grid grid-cols-2 gap-20 md:grid-cols-2 lg:grid-cols-4'>
              {activities.map((activity) => (
                <LandingCard key={activity.id} activity={activity} />
              ))}
            </section>

            {/* 페이지네이션 */}
            {totalCount > 0 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.set('page', newPage.toString());
                  router.push(`?${newParams.toString()}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
