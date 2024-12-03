const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/filmsGestionnaire', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const movieSchema = new mongoose.Schema({
    title: String,
    genre: String,
    description: String,
    imageUrl: String,
    imdbLink: String,
    reviews: [{
        username: String,
        rating: Number,
        reviewText: String,
    }],
});

const Movie = mongoose.model('Movie', movieSchema);

const seedMovies = async () => {
    await Movie.deleteMany();
    const movies = [
        {
            title: 'Morbius',
            genre: 'Horror',
            description: 'Biochemist turned vampire...',
            imageUrl: '/images/22.png',
            imdbLink: 'https://www.imdb.com/title/tt5108870/',
        },
        {
            title: 'Robin des Bois',
            genre: 'Horror',
            description: 'Dark reimagining of Robin Hood...',
            imageUrl: '/images/20.png',
            imdbLink: 'https://www.imdb.com/title/tt13486034/',
        },
        {
            title: 'Fright Night',
            genre: 'Comedy',
            description: 'Teenager suspects his neighbor is a vampire...',
            imageUrl: '/images/8.png',
            imdbLink: 'https://www.imdb.com/title/tt1438176/',
        },
        {
            title: 'Light',
            genre: 'Psychological',
            description: 'Exploring isolation and supernatural...',
            imageUrl: '/images/2.png',
            imdbLink: 'https://www.imdb.com/title/tt6763664/',
        },
        {
            title: 'After',
            genre: 'Supernatural',
            description: 'Group of friends facing an ancient curse...',
            imageUrl: '/images/10.png',
            imdbLink: 'https://www.imdb.com/title/tt4073890/',
        },
    ];
    await Movie.insertMany(movies);
    console.log('Database seeded!');
};

app.get('/movies', async (req, res) => {
    const genre = req.query.genre;
    const movies = await Movie.find(genre ? { genre } : {});
    res.json(movies);
});

app.get('/movies/:movieId/reviews', async (req, res) => {
    const { movieId } = req.params;
    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }
        res.json(movie.reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews!' });
    }
});

app.post('/movies/:movieId/review', async (req, res) => {
    const { movieId } = req.params;
    const { username, rating, reviewText } = req.body;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }

        movie.reviews.push({ username, rating, reviewText });
        await movie.save();

        res.status(200).json({ message: 'Review submitted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting review!' });
    }
});

app.put('/movies/:movieId/review/:reviewId', async (req, res) => {
    const { movieId, reviewId } = req.params;
    const { username, rating, reviewText } = req.body;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }

        const review = movie.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found!' });
        }

        review.username = username || review.username;
        review.rating = rating || review.rating;
        review.reviewText = reviewText || review.reviewText;

        await movie.save();
        res.status(200).json({ message: 'Review updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review!' });
    }
});

app.delete('/movies/:movieId/review/:reviewId', async (req, res) => {
    const { movieId, reviewId } = req.params;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found!' });
        }

        movie.reviews.id(reviewId).remove();
        await movie.save();

        res.status(200).json({ message: 'Review deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review!' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/rate', (req, res) => {
    res.sendFile(path.join(__dirname, 'rate.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
