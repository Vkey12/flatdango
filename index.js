document.addEventListener("DOMContentLoaded", function () {
    // Flag to check if it's the initial page load
    let initialLoad = true;

    // Fetch movies when the page is loaded
    getMovies();

    // Function to fetch movies from the server
    function getMovies() {
        fetch(`http://localhost:3000/films`)
            .then((response) => response.json())
            .then((films) => {
                console.log(films);
                // Display the list of movies
                showMovieDetails(films);
            })
            .catch((error) => console.error("Error fetching films:", error));
    }

    // Function to display the list of movies
    function showMovieDetails(films) {
        const allMovies = document.getElementById("list");

        films.forEach((movie, index) => {
            const list = document.createElement("li");

            list.textContent = movie.title;
            list.id = movie.id;
            list.addEventListener("click", seeMovieDetails);
            allMovies.appendChild(list);

            // Display details of the first movie on the initial load
            if (index === 0 && initialLoad) {
                listMovieDetails(movie.id);
            }
        });
    }

    // Function to display details of a specific movie when clicked
    function seeMovieDetails(event) {
        listMovieDetails(event.target.id);
    }

    // Function to fetch and display details of a movie
    function listMovieDetails(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`)
            .then((response) => response.json())
            .then((movie) => {
                let movieListed = document.getElementById("movies");

                // Display details of the selected movie
                movieListed.innerHTML = `
                    <h2>${movie.title}</h2>
                    <img src="${movie.poster}" alt="${movie.title} Poster"/>
                    <p>${movie.description}</p>
                    <ul>
                        <li>RUNTIME: ${movie.runtime}</li>
                        <li>NUMBER OF SEATS: ${movie.capacity}</li>
                        <li>TIME: ${movie.showtime}</li>
                        <li>AVAILABLE TICKETS: ${movie.capacity - movie.tickets_sold}</li>
                        <li>BUY TICKET: <button id="buyTicketBtn">${movie.capacity === movie.tickets_sold ? 'SOLD OUT' : 'BUY TICKET'}</button></li>
                    </ul>`;

                let buyTicketBtn = document.getElementById("buyTicketBtn");
                // Add event listener to the "BUY TICKET" button
                buyTicketBtn.addEventListener("click", (event) => {
                    event.preventDefault()
                    // Call the function to buy a ticket
                    buyTicket(movie.id, movie.capacity, movie.tickets_sold);
                });
            })
            .catch((error) => {
                console.error("Error fetching or displaying movie details:", error);
            });
    }

    // Function to buy a ticket for the selected movie
    function buyTicket(movieId, capacity, ticketsSold) {
        if (ticketsSold < capacity) {
            // Update the server with the new ticket count
            fetch(`http://localhost:3000/films/${movieId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tickets_sold: ticketsSold + 1,
                }),
            })
            .then(res => res.json())
            .then((updatedMovie) => {
                console.log('Tickets updated successfully:', updatedMovie);

                // Update the ticket count directly in the existing movie details
                const availableTicketsElement = document.querySelector('filmId');
                availableTicketsElement.textContent = `AVAILABLE TICKETS: ${updatedMovie.capacity - updatedMovie.tickets_sold}`;

                // Optionally, update the "BUY TICKET" button text based on ticket availability
                const buyTicketBtn = document.getElementById("buyTicketBtn");
                buyTicketBtn.textContent = updatedMovie.capacity === updatedMovie.tickets_sold ? 'SOLD OUT' : 'BUY TICKET';
            })
            .catch((error) => {
                console.error("Error updating tickets:", error);
            });
        }
    }
});
