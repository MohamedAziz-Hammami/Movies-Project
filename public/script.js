document.getElementById("genre-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const genre = document.getElementById("genre-select").value;

    if (!genre) {
        alert("Please select a genre!");
        return;
    }

    try {
        const response = await fetch(`/movies?genre=${genre}`);
        const movies = await response.json();

        const container = document.getElementById("movies-container");
        container.innerHTML = ""; 

        if (movies.length === 0) {
            container.innerHTML = "<p>No movies found for this genre.</p>";
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";

            movieCard.innerHTML = `
                <img src="${movie.imageUrl}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>${movie.description}</p>
                <a href="${movie.imdbLink}" target="_blank">View on IMDb</a>
            `;

            container.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        alert("An error occurred. Please try again.");
    }
});
