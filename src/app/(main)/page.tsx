import Banner from '@/components/landing/Banner';
import SearchBar from '@/components/landing/SearchBar';
import MostCommentedActivities from '@/components/landing/MostCommentedActivities';
import AllActivities from '@/components/landing/AllActivities';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GlobalNomad',
  description: '코드노마드 팀프로젝트',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function Home() {
  return (
    <main className='bg-gradient-main w-full pt-70 md:pt-100'>
      <div className='mx-auto w-full max-w-[1120px] px-24 md:px-30 lg:px-40'>
        <Banner />
        <SearchBar />
        <MostCommentedActivities />
        <AllActivities />
      </div>
    </main>
  );
}
