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

app.get('/boxes', (req, res) => {
  connection
    .promise()
    .query('SELECT * FROM boxes ORDER BY id ASC')
    .then((result) => {
      res.status(200).json(result[0]);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Something wrong happened x( ');
    });
});

app.get('/boxes/:id', async (req, res) => {
  try {
    const [[product]] = await connection
      .promise()
      .query('SELECT * FROM boxes WHERE id = ?', [req.params.id]);

    res.send(product);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/boxes/postalcode/:cp', async (req, res) => {
  try {
    const [product] = await connection
      .promise()
      .query('SELECT * FROM boxes WHERE CP = ?', [req.params.cp]);

    res.send(product);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/books/search', (req, res) => {
  let sqlRequest = 'SELECT * FROM book';
  sqlRequest +=
    " WHERE title LIKE CONCAT (LOWER('%'), LOWER(?), LOWER('%')) OR author LIKE CONCAT (LOWER('%'), LOWER(?), LOWER('%')) AND out_of_stock = 0 ";
  connection
    .promise()
    .query(sqlRequest, [req.query.search, req.query.search])
    .then((result) => {
      res.status(200).send(result[0]);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

// app.get('/books/search', (req, res) => {
//   let sqlRequest = 'SELECT * FROM book';
//   sqlRequest +=
//     'WHERE title LIKE LOWER(?) OR author LIKE LOWER(?) AND out_of_stock = 0 ';
//   connection
//     .promise()
//     .query(sqlRequest, [
//       `%${req.query.search.toLowerCase()}%`,
//       req.query.search,
//     ])
//     .then((result) => {
//       res.status(200).send(result[0]);
//     })
//     .catch((error) => {
//       res.status(500).send(error);
//     });
// });

app.get('/books/:id', (req, res, next) => {
  connection
    .promise()
    .query('SELECT * FROM book WHERE id = ?', [req.params.id])
    .then((result) => {
      res.status(200).json(result[0][0]);
    })
    .catch(() => {
      res.status(500).send('Error retrieving data from database');
    });
});

app.get('/books/isbn/:isbn', (req, res, next) => {
  connection
    .promise()
    .query('SELECT box_number FROM book WHERE isbn = ?', [req.params.isbn])
    .then((result) => {
      res.status(200).json(result[0]);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Error retrieving data from database');
    });
});

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

app.get('/books/note/:note', (req, res) => {
  connection
    .promise()
    .query('SELECT * FROM book WHERE note = ?', [req.params.note])
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => {
      res.status(500).send('Error retrieving data from database');
    });
});

app.get('/boxes/:idBox/books', (req, res, next) => {
  console.log('ok');
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

app.patch('/boxes/:idBox', (req, res, next) => {
  const { action } = req.query;
  let sqlRequest = 'UPDATE boxes SET quantity = quantity';
  let retour = '';
  if (action === 'add') {
    sqlRequest += ' + 1 WHERE id = ?';
    retour = 'plus';
  }
  if (action === 'delete') {
    sqlRequest += ' - 1 WHERE id = ?';
    retour = 'moins';
  }
  connection
    .promise()
    .query(sqlRequest, [req.params.idBox])
    .then(() => {
      res.status(200).send(retour);
    })
    .catch(() => {
      res.status(500).send('error');
    });
});

app.post('/books/:isbn/:boxId/:note/:cond', (req, res, next) => {
  connection
    .promise()
    .query('SELECT * FROM book WHERE isbn= ?', [req.params.isbn])
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
          selection: 0,
        };
        const resp = { author: book.author, title: book.title };
        res.status(200).json(resp);
        connection
          .promise()
          .query(
            'INSERT INTO book(title, editions, author, publication_year, synopsis, picture, pages_nbr, note, cond, box_number, isbn, to_borrow, to_delete, out_of_stock, selection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
              0,
            ]
          )
          .then((result) => {
            console.log('Book successfully added to database');
          })
          .catch(() => {
            res.status(500).send('first Error adding book');
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
              out_of_stock: 0,
              selection: 0,
            };
            const resp = { author: book.author, title: book.title };
            res.status(200).json(resp);
            connection
              .promise()
              .query(
                'INSERT INTO book(title, editions, author, publication_year, synopsis, picture, pages_nbr, note, cond, box_number, isbn, to_borrow, to_delete, out_of_stock, selection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
            res.status(500).send('Error with axios');
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
