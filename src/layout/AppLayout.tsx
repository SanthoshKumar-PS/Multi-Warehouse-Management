import Navbar from '@/components/Navbar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
        <Navbar/>
        <main>
            <Outlet/>
        </main>

    </div>
  )
}

export default AppLayout