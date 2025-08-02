'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import instance from '@/lib/api/axios';
import type { Activity } from '@/components/home/LandingCard';
import LandingCard from '@/components/home/LandingCard';
import Pagination from '@/components/common/Pagination';
import NoResult from '@/components/search/NoResult';
import Banner from '@/components/home/Banner';
import LoadingPage from '@/components/common/LoadingPage';
import showToastError from '@/lib/showToastError';

const SearchContent = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const page = Number(searchParams.get('page')) || 1;
  const size = 8;
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await instance.get('/activities', {
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
        showToastError(err, {
          fallback: '검색 결과를 불러오는 데 실패했어요.',
          overrides: {
            403: '접근 권한이 없어요.',
            404: '검색 결과가 없어요.',
          },
        });
      }
    };

    fetchActivities();
  }, [keyword, page]);

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    router.push(`?${newParams}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / size);

  return (
    <main className='bg-gradient-main min-h-screen w-full px-20'>
      <div className='mx-auto max-w-screen-xl pt-40 md:pt-100'>
        <Banner />

        <div className='text-20-b mt-40 mb-10'>‘{keyword}’에 대한 검색 결과</div>
        {totalCount > 0 && (
          <div className='text-14-m mb-10 px-8 text-gray-400'>총 {totalCount}개</div>
        )}

        {activities.length === 0 ? (
          <NoResult />
        ) : (
          <>
            <section className='grid grid-cols-2 gap-20 md:grid-cols-2 lg:grid-cols-4'>
              {activities.map((activity) => (
                <LandingCard key={activity.id} activity={activity} />
              ))}
            </section>

            {totalCount > 0 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
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
    <Suspense fallback={<LoadingPage />}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
