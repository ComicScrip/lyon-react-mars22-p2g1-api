/* eslint-disable camelcase */
const connection = require('./db-config');
const express = require('express');
const app = express();
const axios = require('axios');

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log(
      'connected to database with threadId :  ' + connection.threadId
    );
  }
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
  app.options('*', (req, res) => {
    res.header(
      'Access-Control-Allow-Methods',
      'GET, PATCH, PUT, POST, DELETE, OPTIONS'
    );
    res.send();
  });
});

app.use(express.json());

app.get('/books', (req, res, next) => {
  connection
    .promise()
    .query(
      'SELECT id, title, author, isbn, editions, publication_year, pages_nbr, synopsis, picture, note, box_number, cond, to_borrow, to_delete, out_of_stock FROM book ORDER BY id DESC'
    )
    .then((result) => {
      res.status(200).json(result[0]);
    })
    .catch(() => {
      res.status(500).send('Error retrieving data from database');
    });
});

app.get('/boxes/:idBox/books', (req, res, next) => {
  connection
    .promise()
    .query(
      'SELECT id, title, author, isbn, editions, publication_year, pages_nbr, synopsis, picture, note, box_number, cond, to_borrow, to_delete, out_of_stock FROM book WHERE box_number = ? AND out_of_stock = 0 ORDER BY id DESC',
      [req.params.idBox]
    )
    .then((result) => {
      res.status(200).json(result[0]);
    })
    .catch(() => {
      res.status(500).send('Error retrieving data from database');
    });
});

app.get('/books/:isbn/:boxId/:note/:cond', (req, res, next) => {
  connection
    .promise()
    .query(
      'SELECT title, author, isbn, editions, publication_year, pages_nbr, synopsis, picture, note, box_number, cond, to_borrow, to_delete, out_of_stock FROM book WHERE isbn= ?',
      [req.params.isbn]
    )
    .then((result) => {
      if (result[0].length > 0) {
        const book = {
          title: result[0][0].title,
          editions: result[0][0].editions,
          author: result[0][0].author,
          publication_year: result[0][0].publication_year,
          picture: result[0][0].picture || null,
          synopsis: result[0][0].synopsis,
          pages_nbr: result[0][0].pages_nbr,
          isbn: result[0][0].isbn,
          box_number: req.params.boxId,
          cond: req.params.cond,
          note: req.params.note,
        };
        res.status(200).json([book.author, book.editions]);
        connection
          .promise()
          .query(
            'INSERT INTO book(title, editions, author, publication_year, synopsis, picture, pages_nbr, note, cond, box_number, isbn, to_borrow, to_delete, out_of_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              book.title,
              book.editions,
              book.author,
              book.publication_year,
              book.synopsis,
              book.picture,
              book.pages_nbr,
              book.note,
              book.cond,
              book.box_number,
              book.isbn,
              0,
              0,
              0,
            ]
          )
          .then((result) => {
            console.log('Book successfully added to database');
          })
          .catch(() => {
            console.log('Error adding book');
          });
      } else {
        axios
          .get(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${req.params.isbn}&idAIzaSyBR5ULsTVhH932FKKrw-3qTq1FgTKKHccM`
          )
          .then((response) => response.data)
          .then((data) => {
            let img = '';
            if (data.items[0].volumeInfo.imageLinks) {
              img = data.items[0].volumeInfo.imageLinks.smallThumbnail;
            }
            const book = {
              title: data.items[0].volumeInfo.title,
              editions: data.items[0].volumeInfo.publisher,
              author: data.items[0].volumeInfo.authors[0],
              publication_year: data.items[0].volumeInfo.publishedDate.slice(
                0,
                4
              ),
              picture: img || null,
              synopsis: data.items[0].volumeInfo.description,
              pages_nbr: data.items[0].volumeInfo.pageCount,
              isbn: req.params.isbn,
              box_number: req.params.boxId,
              cond: req.params.cond,
              note: req.params.note,
            };
            res.status(200).json([book.author, book.editions]);
            connection
              .promise()
              .query(
                'INSERT INTO book(title, editions, author, publication_year, synopsis, picture, pages_nbr, note, cond, box_number, isbn, to_borrow, to_delete, out_of_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                  book.title,
                  book.editions,
                  book.author,
                  book.publication_year,
                  book.synopsis,
                  book.picture,
                  book.pages_nbr,
                  book.note,
                  book.cond,
                  book.box_number,
                  book.isbn,
                  0,
                  0,
                  0,
                ]
              )
              .then((result) => {
                console.log('Book successfully added to database');
              })
              .catch(() => {
                res.status(500).send('Error adding book');
              });
          })
          .catch(() => {
            console.log('error with axios');
          });
      }
    })
    .catch(() => {
      res.status(500).send('book is nowhere');
    });
});

app.post('/books', (req, res, next) => {
  // eslint-disable-next-line camelcase
  const {
    title,
    editions,
    author,
    year,
    synopsis,
    picture,
    pages_nbr,
    note,
    cond,
    box_number,
    isbn,
    to_borrow,
    to_delete,
    out_of_stock,
  } = req.body;
  connection
    .promise()
    .query(
      'INSERT INTO book(title, editions, author, publication_year, synopsis, picture, pages_nbr, note, cond, box_number, isbn, to_borrow, to_delete, out_of_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        editions,
        author,
        year,
        synopsis,
        picture,
        pages_nbr,
        note,
        cond,
        box_number,
        isbn,
        to_borrow,
        to_delete,
        out_of_stock,
      ]
    )
    .then((result) => {
      res.status(200).send('Book successfully added to database');
    })
    .catch(() => {
      res.status(500).send('Error adding book');
    });
});

app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  connection
    .promise()
    .query('UPDATE book SET out_of_stock = 1 WHERE id = ?', [id])
    .then((result) => {
      res.status(200).send('Book successfully updated');
    })
    .catch(() => {
      res.status(500).send('Error updating book');
    });
});

module.exports.app = app;
