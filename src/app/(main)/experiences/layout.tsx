import RouteGuard from '@/components/auth/RouterGuard';

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>;
}
