const LandingCardSkeleton = () => {
  return (
    <div className='mb-20 aspect-[262/366] w-full animate-pulse rounded-4xl bg-gray-100'>
      <div className='aspect-[262/240] w-full rounded-t-4xl bg-gray-200' />
      <div className='flex flex-col justify-center gap-3 px-12 py-10'>
        <div className='h-5 w-3/4 rounded bg-gray-200' />
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4 rounded-full bg-gray-200' />
          <div className='h-4 w-8 rounded bg-gray-200' />
        </div>
        <div className='h-6 w-1/2 rounded bg-gray-200' />
      </div>
    </div>
  );
};

export default LandingCardSkeleton;
