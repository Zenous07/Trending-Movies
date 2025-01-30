import React, { useState,useEffect } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

//API - Application Programming Interface - set of rules that allows one software applications to communicate with another software

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY=import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS={
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization:`Bearer ${API_KEY}`
  }
}

const App = () => {

  const [searchTerm,setSearchTerm]=useState('');
  const [errorMessage,setErrorMessage]=useState('');
  const [movieList,setMovieList]=useState([]);
  const [trendingMovies,setTrendingMovies]=useState([]);
  const [isLoading,setIsLoading]=useState(false);
  const [debouncedSearchTerm,setDebouncedSearchTerm]=useState('');

  useDebounce(()=> setDebouncedSearchTerm(searchTerm),700,[searchTerm])

  const fetchMovies =async(query='')=>{

    setIsLoading(true);
    setErrorMessage('');

    try{

      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint,API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed To Fetch Movies');
      }
      
      const data=await response.json();
      
      if(data.response==='False'){
        setErrorMessage(data.Error || 'Failed To Fetch Movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || [] );

      if(query && data.results.length >0){
        await updateSearchCount(query,data.results[0]);
      }
    } catch(error){
      console.log(`Error Fetching Movies : ${error}`);
      setErrorMessage(`Error Fetching Movies : ${error}`)
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async()=>{
    try{

        const movies = await getTrendingMovies();
        setTrendingMovies(movies);
    } catch(error) {
      console.log(`Error Fetching Trending Movies : ${error}`);
      setTrendingMovies('Error Fetching Movies.');
    }
  }

  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]);

  useEffect(()=>{
    loadTrendingMovies();
  },[])

  return (
    <main>
      <div className="pattern"></div>

    <div className="wrapper">
      <header>
        <img src='./hero.png' alt='Hero Banner'/>
        <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without Hassel</h1>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      </header>

      {trendingMovies.length>0 ? (
        <section className='trending'>
          <h2> Trending Movies</h2>

          <ul>
            {trendingMovies.map((movie,index)=>{
              return(
              <li key={movie.$id}>
                <p>{index+1}</p>
                <img src={movie.poster_url} alt={movie.title}/>
              </li>
              );
            })}
          </ul>
        </section>
      ):``}

      <section className='all-movies'>
          <h2 className='mt-[40px]'>All Movies</h2>

          {isLoading?(
            <Spinner />
          ):errorMessage ?(
            <p className='text-red-500'>{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie)=>(
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
      </section>

    </div>

    </main>
  )
}

export default App