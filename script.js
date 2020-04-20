const booksContainer = document.getElementById("books-container");
const booksTitle = document.getElementById("books-title");
const deleteAllButton = document.getElementById("delete-all-button");
const clearButton = document.getElementById("clear-button");
const headerBrand = document.getElementById("brand");

// Tippy.js
tippy('#brand', {
  content: "Change Theme",
  arrow: false,
  followCursor: true
});

// Spinner
const spinner = document.getElementById('spinner');
spinner.style.display = "none"

// Snackbar
const snackbar = document.getElementById("snackbar");

// Favorites
const favoritesContainer = document.getElementById("favorites-container");
const favoritesMsg = document.getElementById('favorites-message');
const favoritesTitle = document.getElementById('favorites-title');

favoritesTitle.style.display = 'none';

// Grid
const gridContainer = document.querySelector('.container');
const gridRight = document.querySelector('.right-half');
const gridLeft = document.querySelector('.left-half');

gridContainer.style.display = "initial"
gridRight.style.display = "initial"
gridLeft.style.display = "initial"

const form = document.querySelector(".form");
const input = document.querySelector(".input");
const book = document.querySelector(".book");

// Array where my favorite books will go into and put into localstorage
const favoriteBooks = localStorage.getItem("books")
  ? JSON.parse(localStorage.getItem("books"))
  : [];

localStorage.setItem("books", JSON.stringify(favoriteBooks));

const booksLocalStorage = JSON.parse(localStorage.getItem("books"));

// Clear icon and input text change
clearButton.addEventListener('click', (e) => {
  e.preventDefault();
  input.value = "";
});

input.addEventListener('focus', () => {
  input.placeholder = "Search books...";
})

input.addEventListener('blur', () => {
  input.placeholder = "Search...";
})

input.addEventListener('input', () => {
  clearButton.style.display = "block";
})

/** Toggle between theme. */
let darkmode = localStorage.getItem('darkmode');
let flag = JSON.parse(darkmode);

const toggleDarkMode = () => {
  localStorage.setItem('darkmode', flag = flag ? false : true)
  document.body.classList.toggle("darkTheme")
  checkTheme();
}

/** Check which theme is turned on. */
const checkTheme = () => {
  let darkmode = localStorage.getItem('darkmode');
  // console.log(darkmode);
  // Type from localstorage is a string not boolean
  if (darkmode == 'true') {
    document.body.classList.add('darkTheme');
  } else if (darkmode == 'false') {
    document.body.classList.remove('darkTheme');
  }
}

checkTheme()

// Dark mode
headerBrand.addEventListener('click', toggleDarkMode);

/** Fetch books from Google Books api.
 *  @param {String} book
 *  @returns {Promise} 
 */
const fetchBooks = async book => {
  const apiKey = config.apiKey;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${book}&key=${apiKey}&start-index=5`;
  const api_call = await fetch(url);
  const data = api_call.json();
  return data;
};

/** Show the fetched books. */
const showBooks = () => {
  if (input.value !== '') {
    spinner.style.display = "inline-block";
    fetchBooks(input.value)
      .then(data => {
        // console.log(data)
        spinner.style.display = "none";
        createBooks(data);

        // Check if favorites has elements
        if (favoritesContainer.hasChildNodes()) {
          gridContainer.style.display = "grid"
        }
      })
      .catch(err => {
        console.log(err)
      });
  }
};

/** Create books from api data.
 *  @param {Object} bookData
 */
const createBooks = bookData => {
  const books = bookData.items;

  if (books) {

    booksTitle.style.display = "flex";

    books.forEach((book, index) => {

      // Data from api
      const bookId = book.id;
      const bookImage = book.volumeInfo.imageLinks.thumbnail ? book.volumeInfo.imageLinks.thumbnail : "https://via.placeholder.com/150";
      const bookTitle = book.volumeInfo.title;
      const authors = book.volumeInfo.authors;
      const publishedDate = book.volumeInfo.publishedDate;

      let formattedAuthor;
      authors.map((author, i) => i === 0 ? formattedAuthor = author.replace(/,/g, ' ') : null);

      // Dom elements
      const bookElement = document.createElement("div");
      bookElement.classList.add("book");
      bookElement.innerHTML = `
        <img src=${bookImage} />
        <div class="overlay">
          <div class="content">
            <h4>${bookTitle}</h4> 
            <p>${publishedDate}</p>      
            <p>${formattedAuthor}</p>
          </div>
        </div>
      `;

      // Add to page
      booksContainer.appendChild(bookElement);

      // Add book elements to localstorage
      bookElement.addEventListener("click", () => {

        // When we click on a book we add the bookObject (data we want from the book) to localstroage
        let bookObject = {
          id: bookId,
          ImageSrc: bookImage,
          bookName: bookTitle,
          bookAuthors: authors,
          bookPublishedDate: publishedDate,
        };

        // Check if added book is not a duplicate
        favoriteBooks.forEach(a1 => {
          if (a1.id === book.id) {
            swal("Oops", "You already added this book!", "error", {
              timer: 10000,
            })
            throw new Error('You cannot add duplicate books')
          }
        })

        favoriteBooks.push(bookObject);

        gridContainer.style.display = "grid";
        favoritesTitle.style.display = "block";

        createSnackBar('Succesfully added item', '#2EA650');

        localStorage.setItem('books', JSON.stringify(favoriteBooks));
        createFavoritesBooks(bookObject);


      });
    });
  }

  else {
    booksTitle.style.display = "none";
    const errorMessage = document.createElement("h1");
    errorMessage.classList.add("error-message");
    errorMessage.textContent = "We could not find a book for your search";
    booksContainer.appendChild(errorMessage);
  }
};

/** Create favorite books on click.
 *  @param {Object} bookObjectData
 */
const createFavoritesBooks = (bookObjectData) => {

  if (bookObjectData) {
    favoritesTitle.style.display = "block";
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    const bookId = bookObjectData.id;
    const bookImage = bookObjectData.ImageSrc;
    const bookTitle = bookObjectData.bookName;

    const authors = bookObjectData.bookAuthors;
    const publishedDate = bookObjectData.bookPublishedDate;

    let formattedAuthor;
    // Only get first item in array from authors
    authors.map((author, i) => i === 0 ? formattedAuthor = author.replace(/,/g, ' ') : null);

    bookElement.innerHTML = `
      <img class="book-image" src=${bookImage} />
      <div class="overlay">
        <div class="content">
          <h4>${bookTitle}</h4> 
          <p>${publishedDate}</p>      
          <p>${formattedAuthor}</p>
        </div>
      </div>
    `

    favoritesContainer.appendChild(bookElement);

    bookElement.addEventListener('click', () => {
      removeBook(bookElement, bookId);
      createSnackBar('Succesfully removed item', '#f27474');
    })
  }
};


/** Remove item from LocalStorage array and DOM.
 *  @param {Object} book
 *  @param {String} id
 */
const removeBook = (book, id) => {

  // Loop over localstorage array
  favoriteBooks.forEach((favorite, index) => {
    if (favorite.id === id) {

      // Get out of array
      favoriteBooks.splice(index, 1)

      // Update the localStorage
      localStorage.setItem("books", JSON.stringify(favoriteBooks));
    }
  });

  // Remove from the dom
  book.remove();

  if (favoriteBooks.length === 0 && favoritesContainer.innerHTML === "") {
    favoritesTitle.style.display = 'none'
    gridContainer.style.display = "initial"
  }
}

/** Create a customizable snackbar.
 *  @param {String} text 
 *  @param {String} backgroundColor 
 */
const createSnackBar = (text, backgroundColor) => {
  snackbar.innerHTML = text;
  snackbar.style.backgroundColor = backgroundColor;
  snackbar.classList.add('show');
  setTimeout(() => {
    snackbar.classList.remove('show')
  }, 3000);
}

/** Get all favorite books from LocalStorage. */
const getFavoriteCards = () => {
  if (booksLocalStorage) {
    favoritesContainer.innerHTML = '';
    booksLocalStorage.forEach(item => {
      createFavoritesBooks(item);
    })
  }
  if (favoritesContainer.innerHTML === '' && booksLocalStorage.length == 0) {
    gridContainer.style.display = "initial";
    gridRight.style.display = "initial";
    gridLeft.style.gridColumn = "initial";
  }
}

getFavoriteCards();

/** Remove all favorite books.  */
const deleteAllFavoriteBooks = () => {
  if (favoritesContainer.innerHTML === '' && booksLocalStorage.length === 0) {
    swal("Empty", "You didn't add any favorites yet!", "error", {
      timer: 10000,
    })
  }
  localStorage.removeItem('books');
  favoriteBooks.length = 0;
  favoritesTitle.style.display = 'none';
  favoritesContainer.innerHTML = '';
  gridContainer.style.display = "initial"
}

deleteAllButton.addEventListener('click', deleteAllFavoriteBooks)

form.addEventListener("submit", e => {
  if (input !== "") {
    e.preventDefault();
    // make it empty for new search
    booksContainer.innerHTML = "";
    showBooks();
  }
});
