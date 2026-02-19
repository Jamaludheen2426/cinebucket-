import TheaterHero from "@/app/components/TheaterHero";
import HomeMoviesList from "@/app/components/HomeMoviesList";
import { Movies } from "../types/movie";
import HomeSearch from "./HomeSearch";
import { Film, Flame, Tv, TrendingUp, Heart, Laugh, Rocket, Clock } from "lucide-react";
import MovieSection from "./MovieSection";
import PaginationComponent from "./PaginationComponent";

interface HomeProps {
  movies: Movies;
  categoryMovies: Record<string, any>;
  totalMovies?: number;
}

const Home = ({ movies, categoryMovies, totalMovies = 0 }: HomeProps) => {

  const safeCategories = categoryMovies || {};

  const validCategories = Object.keys(safeCategories).filter(key =>
    safeCategories[key] && Array.isArray(safeCategories[key]) && safeCategories[key].length > 0
  );


  const totalPages = Math.ceil(totalMovies / 20);

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 text-white min-h-screen">
      {/* Cinematic Theater Hero Section */}
      <TheaterHero movies={movies} />

      {/* Movie Categories Sections */}
      <div className="max-w-7xl mx-auto">
        {validCategories.map((catName) => {
          const movies = safeCategories[catName];
          let icon = <Film className="h-5 w-5" />;
          let iconColor = "text-blue-400";
          let viewAllLink = `/category/${catName.toLowerCase().replace(/\s+/g, '-')}`;

          // Specific styling for certain categories
          if (catName === 'Horror') { icon = <Flame className="h-5 w-5" />; iconColor = "text-red-600"; }
          if (catName === 'Action Movies') { icon = <Film className="h-5 w-5" />; iconColor = "text-red-400"; }
          if (catName === 'Adventure') { icon = <TrendingUp className="h-5 w-5" />; iconColor = "text-green-400"; }
          if (catName === 'Comedy') { icon = <Laugh className="h-5 w-5" />; iconColor = "text-yellow-400"; }
          if (catName === 'Sci-Fi') {
            icon = <Rocket className="h-5 w-5" />;
            iconColor = "text-purple-400";
            viewAllLink = "/category/science-fiction"; // Match the backend map
          }
          if (catName === 'Romantic') { icon = <Heart className="h-5 w-5" />; iconColor = "text-pink-400"; }
          if (catName === 'TV Shows') { icon = <Tv className="h-5 w-5" />; iconColor = "text-blue-400"; viewAllLink = "/tag/tv-show"; }
          if (catName === 'New Releases') { icon = <Flame className="h-5 w-5" />; iconColor = "text-orange-400"; }
          if (catName === 'Recent Movies') { icon = <Clock className="h-5 w-5" />; iconColor = "text-gray-400"; }

          return (
            <div key={catName} className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <div className={`${iconColor} bg-gray-800/50 p-2 rounded-lg`}>
                  {icon}
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">{catName}</h2>
              </div>
              <MovieSection
                title={catName}
                movies={movies}
                viewAllLink={viewAllLink}
              />
            </div>
          );
        })}

        {/* All Films Section - always show */}
        <div className="mb-12 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Film className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              All Films
            </h2>
          </div>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-8">
            Browse through our extensive collection of high-quality movies and TV shows
          </p>
          <HomeMoviesList movies={movies} px="px-0" />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <PaginationComponent
                currentPage={1}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;