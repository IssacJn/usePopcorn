import { useEffect, useState } from "react";

const KEY = "735a417f";

export function useMovies(query) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(
		function () {
			const controller = new AbortController();

			async function fetchMovies() {
				try {
					setIsLoading(true);
					setError("");

					const res = await fetch(
						`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
						{ signal: controller.signal }
					);

					if (!res.ok)
						throw new Error(
							"Something went wrong with fetching movies"
						);

					const data = await res.json();
					if (data.Response === "False")
						throw new Error("Movie Not Found!");

					setMovies(data.Search);
					setError("");
				} catch (err) {
					if (err.message !== "The user aborted a request.") {
						setError(err.message);
					}
				} finally {
					setIsLoading(false);
				}
			}

			if (!query.length) {
				setMovies([]);
				setError("");
				return;
			}

			fetchMovies();

			return function () {
				controller.abort();
			};
		},
		[query]
	);

	return { movies, isLoading, error };
}
