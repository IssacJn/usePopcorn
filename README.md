# UsePopcorn Movie App

This is a movie searching web application which displays details regarding selected movies.

[DEMO LINK](https://the-usepopcorn-v1.netlify.app/)

## Features

Search Functionality: Users can easily search for movies using a search bar, fetching details from the OMDB API.

Movie Details: Clicking on a movie in search results displays comprehensive information like release year, cast, director, and plot summary.

Star Rating System: An adjustable star rating component lets users rate movies based on their preferences.

Watched Movies List: Users can add and view movies they've watched, along with ratings. The list is stored locally for persistence.

## Technologies Used

-   React Front-End:
    Utilizes React for building the front-end.
    State management is handled with useState, useEffect, and useRef hooks.
-   OMDB API Integration:
    Fetches real-time movie information from www.omdbapi.com.
    Provides users with up-to-date data for a seamless experience.
-   Local Storage Handling:
    Custom hooks are employed to store and retrieve user data.
    Watched movies and their ratings are persistently stored in the browser's local storage

## Acknowledgements

-   The OMDB API - [API](www.omdbapi.com)
-   This project is a part of a Udemy course by Jonas Schmedtmann - [Course Link](https://www.udemy.com/course/the-ultimate-react-course/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
