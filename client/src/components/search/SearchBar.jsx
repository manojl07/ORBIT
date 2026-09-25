import React, { useEffect, useRef, useState, } from "react";

import useDebounce from "../../hooks/useDebounce";

import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../../api/user.api";

import { Search, X, } from "lucide-react";

import SearchDropdown from "./SearchDropdown";


const SearchBar = ({ autoFocus = false, onClosePanel, }) => {

  const wrappedRef = useRef(null);

  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query);


  const { data, isLoading, } = useQuery({
    queryKey: ["search-users", debouncedQuery,],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });


  const closeSearch = () => { setQuery(""); onClosePanel?.(); };


  useEffect(() => {
    const handleClick = (e) => {

      if (wrappedRef.current && !wrappedRef.current.contains(e.target)) {
        closeSearch();
      }
    };


    const handleEsc = (e) => {

      if (e.key === "Escape") {
        closeSearch();
      }
    };


    document.addEventListener("mousedown", handleClick);

    window.addEventListener("keydown", handleEsc);


    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);


  return (
    <div ref={wrappedRef} className="relative w-full max-w-none md:max-w-sm" >

      {/* SEARCH INPUT */}
      <div className="relative flex items-center gap-2 w-full bg-zinc-900 px-3 py-2 rounded-xl border border-white/5" >

        <Search size={18} className="shrink-0 text-zinc-500" />


        <input autoFocus={autoFocus} value={query} onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent outline-none text-sm text-white placeholder:text-zinc-500 pr-8" placeholder="Search username..." />


        {/* CLOSE INSIDE INPUT */}

        {(query || onClosePanel) && (
          <button type="button" onClick={closeSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8  text-zinc-400 hover:bg-white/10 hover:text-white transition active:scale-90" aria-label="Clear search">
            <X size={17} />
          </button>
        )}

      </div>


      {/* SEARCH RESULTS */}

      {query.trim() && (
        <SearchDropdown users={data?.data || []} loading={isLoading} onClose={closeSearch} />
      )}
    </div>
  );
};


export default SearchBar;