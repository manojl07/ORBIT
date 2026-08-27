import React, { useEffect, useRef, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'
import {searchUsers} from '../../api/user.api'
import { Search } from "lucide-react";
import SearchDropdown from './SearchDropdown';

const SearchBar = () => {

  const wrappedRef = useRef(null)

  const [query, setQuery] = useState("")

  const debouncedQuery = useDebounce(query)

  const {data, isLoading } = useQuery({
    queryKey: ["search-users", debouncedQuery], 
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0
  })

  useEffect(() => {
    const handleClick = (e) => {
      if(wrappedRef.current && !wrappedRef.current.contains(e.target)){
        setQuery("")
      }
    }

    const handleEsc = (e) => {
      if(e.key === "Escape"){
        setQuery("")
      }
    }

    document.addEventListener("mousedown", handleClick)

    window.addEventListener("keydown", handleEsc)
  
    return () => {
      document.removeEventListener("mousedown", handleClick)
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])
  

  return (
    <div ref={wrappedRef} className='relative w-full max-w-sm' >

      <div className='flex items-center gap-2 bg-zinc-900 px-4 py-2  rounded-xl'>


      <Search  size={18} className='text-zinc-500' />

      <input value={query} onChange={(e) => setQuery(e.target.value)} className='bg-transparent outline-none flex-1 text-white' />

      </div>

      {query.trim() && (
        <SearchDropdown users={data?.data || []} loading={isLoading} onClose={() => setQuery("")} />
      )}

    </div>
  )
}

export default SearchBar