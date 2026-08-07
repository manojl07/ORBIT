import React from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'


const Navbar = ({ onOpenModal }) => {
  return (
    <nav className='sticky top-0 bg-black border-b border-zinc-800'>

      <div className='max-w-5xl mx-auto h-16 flex items-center justify-between px-4'>

        <Link to='/' className='text-white font-bold'>Orbit</Link>

        <div className='flex gap-4'>

          <button onClick={onOpenModal} className='text-white'>
            <Plus />
          </button>

          <Link to='/profile' className='text-white'>Profile</Link>

        </div>

      </div>

    </nav>
  )
}

export default Navbar