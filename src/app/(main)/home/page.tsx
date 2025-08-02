import Banner from '@/components/landing/Banner';
import MostCommentedActivities from '@/components/landing/MostCommentedActivities';
import AllActivities from '@/components/landing/AllActivities';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WAZY | 체험 예약 플랫폼',
  description: '코드노마드 팀프로젝트',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function Home() {
  return (
    <main className='bg-gradient-main flex min-h-screen w-full flex-col pt-40 md:pt-80'>
      <div className='mx-auto w-full max-w-[1120px] px-24 md:px-30 lg:px-40'>
        <Banner />
        <MostCommentedActivities />
        <AllActivities />
      </div>
    </main>
  );
}
