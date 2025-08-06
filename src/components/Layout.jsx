import { Outlet } from 'react-router-dom';
import LogoHeader from './LogoHeader';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <>
      <LogoHeader />
      <MobileNav />
      <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <Outlet />
      </main>
    </>
  );
}
