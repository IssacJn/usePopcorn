import { useEffect, useState, useRef } from "react";

import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "735a417f";

//------------------APP Component-----------------

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const { movies, isLoading, error } = useMovies(query);
	const [watched, setWatched] = useLocalStorage([], "watched");

	// Functions
	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (selectedId === id ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	return (
		<>
			<Navbar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</Navbar>

			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList
							movies={movies}
							OnSelectMovie={handleSelectMovie}
						/>
					)}

					{error && <ErrorMessage message={error} />}
				</Box>

				<Box>
					{selectedId ? (
						<MovieDetails
							watched={watched}
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMovieList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}
// Loading spinner
function Loader() {
	return (
		<div className="spinner-container">
			<div className="loading-spinner"></div>
		</div>
	);
}

// Error message
function ErrorMessage({ message }) {
	return (
		<div className="error">
			<span>⛔</span>
			{message}
		</div>
	);
}

//------------------Navbar Component-----------------

const Navbar = ({ children }) => {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}
		</nav>
	);
};

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

// Search Query
function Search({ query, setQuery }) {
	const inputEl = useRef(null);

	// To use 'Enter' Key to focus on search box
	useKey("Enter", function () {
		if (document.activeElement === inputEl.current) return;

		inputEl.current.focus();
		setQuery("");
	});

	return (
		<input
			id="search"
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
}

//Number of results found
function NumResults({ movies }) {
	return (
		<p className="num-results">
			<strong>{movies.length}</strong> results
		</p>
	);
}

//------------------Main Component-----------------

const Main = ({ children }) => {
	return <main className="main">{children}</main>;
};

// BOX section
function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button
				className="btn-toggle"
				onClick={() => setIsOpen((open) => !open)}
			>
				{isOpen ? "-" : "+"}
			</button>

			{isOpen && children}
		</div>
	);
}

// Movie list
function MovieList({ movies, OnSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie
					movie={movie}
					key={movie.imdbID}
					OnSelectMovie={OnSelectMovie}
				/>
			))}
		</ul>
	);
}

// Movies
function Movie({ movie, OnSelectMovie }) {
	return (
		<li onClick={() => OnSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>📅</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

// Movie Details
function MovieDetails({ watched, selectedId, onCloseMovie, onAddWatched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	// To count rating decisions made
	const countRef = useRef(0);
	useEffect(
		function () {
			if (userRating) countRef.current += 1;
		},
		[userRating]
	);

	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	// Destructure fetched API result
	// Add destructured result to WatchedMovies
	const {
		Title: title,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
		Writer: writer,
		Language: language,
		Year: year,
	} = movie;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
			countRatingDecision: countRef.current,
		};

		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	useKey("Escape", onCloseMovie);

	//To fetch Movie from the API
	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);

				const res = await fetch(
					`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
				);
				const data = await res.json();

				setMovie(data);
				setIsLoading(false);
			}

			getMovieDetails();
		},
		[selectedId]
	);

	// To change page title to title of the movie selected
	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			return function () {
				document.title = "usePopcorn";
			};
		},

		[title]
	);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${title} movie`} />

						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>Language(s): {language}</p>
							<p>
								<span>⭐</span> {imdbRating} iMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button
											className="btn-add"
											onClick={handleAdd}
										>
											+ Add to List
										</button>
									)}
								</>
							) : (
								<p className="rated">
									You've previously rated this movie
									<span>
										<b> ⭒ {watchedUserRating}</b>
									</span>
								</p>
							)}
						</div>

						<p>
							<em>{plot}</em>
						</p>

						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
						<p>Written by {writer}</p>
						<p>Year: {year}</p>
					</section>
				</>
			)}
		</div>
	);
}

// Watched summary
function WatchedSummary({ watched }) {
	const avgImdbRating = average(
		watched.map((movie) => movie.imdbRating)
	).toFixed(2);
	const avgUserRating = average(
		watched.map((movie) => movie.userRating)
	).toFixed(2);
	const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(
		2
	);

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} </span>
				</p>
			</div>
		</div>
	);
}

// Watched movie list
function WatchedMovieList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>

				<button
					className="btn-delete"
					onClick={() => onDeleteWatched(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	);
}
