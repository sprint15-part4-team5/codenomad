'use client';

const ResponsiveActivityPageSkeleton = () => {
  return (
    <>
      {/* Photo Section Skeleton */}
      <div className='w-full p-10'>
        <div className='relative mb-4 h-300 animate-pulse rounded-lg bg-gray-200 lg:h-534' />
      </div>

      {/* Main Content Layout*/}
      <div className='flex w-full flex-col gap-20 p-10 lg:flex-row lg:gap-40'>
        <article className='flex flex-1 flex-col gap-40'>
          {/* Activity Header Skeleton */}
          <div className='space-y-6'>
            <div className='h-16 w-1/6 animate-pulse rounded bg-gray-200' />
            <div className='h-16 w-2/3 animate-pulse rounded bg-gray-200' />
            <div className='h-16 w-1/3 animate-pulse rounded bg-gray-200' />
          </div>

          {/* Activity Description Skeleton */}
          <div className='space-y-4'>
            <div className='h-18 w-1/6 animate-pulse rounded bg-gray-200' />
            <div className='h-32 w-full animate-pulse rounded bg-gray-200' />
          </div>

          {/* Activity Map Section Skeleton */}
          <div className='space-y-4'>
            <div className='h-18 w-1/6 animate-pulse rounded bg-gray-200' />
            <div className='h-300 w-full animate-pulse rounded-lg bg-gray-200' />
          </div>

          {/* Activity Review Section Skeleton */}
          <div className='space-y-4'>
            <div className='h-18 w-1/6 animate-pulse rounded bg-gray-200' />
            <div className='h-100 w-full animate-pulse rounded bg-gray-200' />
            <div className='h-100 w-full animate-pulse rounded bg-gray-200' />
          </div>
        </article>

        {/* Reservation Section Skeleton - 데스크톱에서만 표시 */}
        <section className='hidden lg:sticky lg:top-[6.25rem] lg:flex lg:w-[25.625rem] lg:flex-col lg:gap-24 lg:self-start'>
          <div className='space-y-6 rounded-lg border border-gray-200 p-20'>
            <div className='mt-10 h-30 w-1/2 animate-pulse rounded bg-gray-200' />
            <div className='h-400 w-full animate-pulse rounded bg-gray-200' />
            <div className='h-40 w-full animate-pulse rounded bg-gray-200' />
            <div className='h-150 w-full animate-pulse rounded bg-gray-200' />
          </div>
        </section>
      </div>
    </>
  );
};

export default ResponsiveActivityPageSkeleton;
