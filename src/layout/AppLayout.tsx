import Navbar from '@/components/Navbar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
        <Navbar/>
        <main className='flex-1 flex flex-col overflow-auto p-2 md:p-4 lg:p-6'>
            <Outlet/>
        </main>

    </div>
  )
}

export default AppLayout