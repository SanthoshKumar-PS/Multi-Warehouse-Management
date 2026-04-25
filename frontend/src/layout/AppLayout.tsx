import Navbar from '@/components/Navbar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
        <Navbar/>
        <main className="flex-1 flex flex-col p-2 md:p-4 lg:p-6 overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>

    </div>
  )
}

export default AppLayout