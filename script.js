const homeAudio = new Audio('sounds/home-song.mp3');
const endAudio = new Audio('sounds/the-end.mp3');
const turnPageAudio = new Audio('sounds/turn-page.mp3');
const letsRead = new Audio('sounds/lets-read.m4a');
const soundControlIcons = document.querySelectorAll('#sound-control, #sound-control-book, #sound-control-end');
const textContents = new Map();
let isSoundOn = true;
let currentBook = null;
let currentPage = 0;
let currentScreen = 'landing';
let soundCombinations = [];

const allAudioElements = [homeAudio, turnPageAudio, endAudio];

// Fetch all book data and render book tiles
document.addEventListener('DOMContentLoaded', async () => {
    console.log('JavaScript loaded');
    
    const booksContainer = document.getElementById('books-container');
    const books = await fetchBooks();
    books.forEach(book => {
        const bookTile = document.createElement('div');
        bookTile.classList.add('tile');
        bookTile.innerHTML = `
            <img src="books/${book.folder}/${book.cover}" alt="${book.title}">
            <p>${book.title}</p>
        `;
        bookTile.addEventListener('click', () => openBook(book));
        booksContainer.appendChild(bookTile);
    });

        // Event listener for clicking on sound combination
        document.getElementById('page-text').addEventListener('click', function(event) {
            if (event.target.classList.contains('sound-combination')) {
                event.stopPropagation(); // Prevent event from bubbling up to tap areas
                const soundFile = event.target.getAttribute('data-sound');
                const audioPath = `sounds/${soundFile}`;
                console.log('Playing sound:', audioPath);

                const audio = new Audio(audioPath);
                audio.play();
            }
    });

    // Event listener for clicking screen to adnavce page
    const tapPrev = document.getElementById('tap-prev');
    const tapNext = document.getElementById('tap-next');

    tapPrev.addEventListener('click', function(event) {
        // Prevent default behavior (like text selection)
        event.preventDefault();
        prevPage();
    });
    
    tapNext.addEventListener('click', function(event) {
        // Prevent default behavior (like text selection)
        event.preventDefault();
        nextPage();
    });

    console.log('Current screen: landing');
});

async function fetchBooks() {
    const response = await fetch('books/index.json');
    const data = await response.json();
    soundCombinations = data.sounds;
    return data.books;
}


function openBook(book) {
    console.log(`Opening book: ${book.title}`);
    currentBook = book;
    currentPage = 0;
    showPage();
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('book-screen').classList.remove('hidden');
    
    updateCurrentScreen('book');
}

function showPage() {
    const page = currentBook.pages[currentPage];
    console.log(`Showing page: ${page}`);
    document.getElementById('page-image').src = `books/${currentBook.folder}/${page.img}`;

    let pageText = page.text;
    const pageTextElement = document.getElementById('page-text');
    pageTextElement.textContent = ''; // Clear existing content

    // Sort sound combinations by length (longest first) to handle overlapping patterns
    const sortedSounds = soundCombinations.sort((a, b) => b.combination.length - a.combination.length);

    let lastIndex = 0;
    const regex = new RegExp(sortedSounds.map(s => `(${s.combination})`).join('|'), 'gi');

    let match;
    while ((match = regex.exec(pageText)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            pageTextElement.appendChild(document.createTextNode(pageText.substring(lastIndex, match.index)));
        }

        // Find which sound combination matched
        const matchedSound = sortedSounds.find(s => match[0].toLowerCase() === s.combination.toLowerCase());

        // Create span for the sound combination
        const span = document.createElement('span');
        span.className = 'sound-combination';
        span.setAttribute('data-sound', matchedSound.sound);
        span.textContent = match[0];
        pageTextElement.appendChild(span);

        lastIndex = regex.lastIndex;
    }

    // Add any remaining text
    if (lastIndex < pageText.length) {
        pageTextElement.appendChild(document.createTextNode(pageText.substring(lastIndex)));
    }

    if (isSoundOn) turnPageAudio.play();
}

function nextPage() {
    if (currentPage < currentBook.pages.length - 1) {
        currentPage++;
        showPage();
    } else {
        showEndScreen();
    }
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        showPage();
    }
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('book-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('landing').classList.add('hidden');
    
    animateTextMl6();
    
    updateCurrentScreen('home');
 
}

function showEndScreen() {
    console.log('Showing end screen');
    document.getElementById('book-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');

    animateTextMl2();
    
    updateCurrentScreen('end');

    showConfetti();
}