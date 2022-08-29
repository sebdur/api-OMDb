import { useState } from 'react';
import Parse from 'parse/dist/parse.min.js';
import './App.scss';

const parseHostUrl = process.env.REACT_APP_PARSE_HOST_URL;
const parseAplicationId = process.env.REACT_APP_PARSE_APPLICATION_ID;
const parseJavascriptKey = process.env.REACT_APP_PARSE_JAVASCRIPT_KEY;
Parse.initialize(parseAplicationId, parseJavascriptKey);
Parse.serverURL = parseHostUrl;

function App() {
  const [queryMovies, setQueryMovies] = useState([]);
  const [queryResults, setQueryResults] = useState([]);

  function clearQueryMovies() {
    setQueryMovies([]);
  };

  function clearQueryResults() {
    setQueryResults([]);
  };

  async function searchTitles(e) {
    const query = e.target.value;
    try {
      if (query.length >= 3) {
        const data = await Parse.Cloud.run(`fetchMovies/?search=${query}`);
        data ? setQueryMovies(data) : clearQueryMovies();
        clearQueryResults();
      } else {
        clearQueryMovies();
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchList() {
    const parseQuery = new Parse.Query('Movie');
    try {
      const queryResult = await parseQuery.find();
      queryResult ? setQueryResults(queryResult) : console.log('No results.');
      clearQueryMovies();
    } catch (err) {
      console.log(err);
    }
  }

  async function addMovie(movie) {
    const Movie = new Parse.Object('Movie');
    Movie.set('Poster', movie.Poster);
    Movie.set('Title', movie.Title);
    Movie.set('Type', movie.Type);
    Movie.set('Year', movie.Year);
    Movie.set('imdbID', movie.imdbID);
    try {
      await Movie.save();
      alert('Añadida a la lista!');
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteMovie(id) {
    const Movie = new Parse.Object('Movie');
    Movie.set('objectId', id);
    try {
      await Movie.destroy();
      fetchList();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className='container'>
      <hr />
      <div className='row g-0'>
        <div className='col-3 m-auto'>
          <span className='title'>OMDb</span>
        </div>
        <div className='col-6'>
          <input className='form-control' onChange={searchTitles} placeholder='Buscar...' />
        </div>
        <div className='col-3'>
          <button className='btn btn-outline-secondary float-end' onClick={() => fetchList()}>
            Lista
          </button>
        </div>
      </div>
      <hr />
      <div className='row'>
        {queryResults.length >= 1 && <h2>Lista</h2>}
        {queryResults.map((result, key) => (
          <div className='col-lg-3' key={key}>
            <div className='card'>
              <img src={result.get('Poster')} className='card-img-top' alt='...' />
              <div className='card-body'>
                <h5 className='card-title'>{result.get('Title')}</h5>
                <p className='card-text'>
                  <span className='text-capitalize'>{result.get('Type')}</span> {result.get('Year')}
                </p>
                <button onClick={() => deleteMovie(result.id)} className='btn btn-danger'>
                  Quitar de la lista
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='row'>
        {queryMovies.length > 0 && (
          <div>
            <h2>Resultados de la busqueda</h2>
            <h5>{queryMovies.length} coincidencias</h5>
          </div>
        )}
        {queryMovies.map((movie, key) => (
          <div className='col-lg-3' key={key}>
            <div className='card'>
              <img src={movie.Poster} className='card-img-top' alt='...' />
              <div className='card-body'>
                <h5 className='card-title'>{movie.Title}</h5>
                <p className='card-text'>
                  <span className='text-capitalize'>{movie.Type}</span> {movie.Year}
                </p>
                <button onClick={() => addMovie(movie)} className='btn btn-primary'>
                  Añadir a la lista
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
