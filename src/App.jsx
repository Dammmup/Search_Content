import { Routes, Route } from "react-router-dom";
import { MainPage } from './MainPage';
import { SearchFilm } from './UI/pages/SearchFilm';
import { SearchMusic } from './UI/pages/SearchMusic';
import { SearchImage } from './UI/pages/SearchImage';
import { RickAndMorty } from './UI/pages/RickAndMorty';
import { NumbersFact } from './UI/pages/NumbersFact';
import { SearchGames } from './UI/pages/SearchGames';
import { SearchJokes } from './UI/pages/SearchJokes';
import { SearchCrypto } from './UI/pages/SearchCrypto';
import { Empty } from './UI/pages/Empty';
import { Profile } from './UI/pages/Profile';
import { Favorites } from "./UI/pages/Favorites";
import { NotFound } from "./UI/pages/NotFound";
import { Community } from "./UI/pages/Community";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/movies" element={<SearchFilm />} />
          <Route path="/music" element={<SearchMusic />} />
          <Route path="/image" element={<SearchImage />} />
          <Route path="/ram" element={<RickAndMorty />} />
          <Route path="/numbers" element={<NumbersFact />} />
          <Route path="/games" element={<SearchGames />} />
          <Route path="/jokes" element={<SearchJokes />} />
          <Route path="/crypto" element={<SearchCrypto />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/empty" element={<Empty />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
