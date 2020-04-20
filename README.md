# Book Tracking App

## About

App which allows to save the books you are currently reading.   
Uses [Google Books API](https://developers.google.com/books).

## Installation and setup

Clone the repository 

```sh
git clone https://github.com/jensrott/book-tracking-app.git
```

Go to folder destination:

```sh
cd book-tracking-app
```

Enter a Google Api key in a config.js file. 
You have to create this file yourself. Here is a template of what this file looks like:  

```js
const config = {
  apiKey: apiKey,
};
```

View index.html in a browser:

## Features

* Search books
* View book information
* Add Favorites
* Delete Favorites
* Form validation
* Snackbar when adding or removing items
* Dark theme
* And more

## Features for later versions

* Print list of books
* Drag and drop
* Pagination