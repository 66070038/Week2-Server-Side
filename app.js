require('dotenv').config();
const express = require('express')
const app = express();
const mysql = require('mysql2');
const port = process.env.PORT || 3000;

app.use(express.json());
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('error', err.message);
        process.exit(1);
    }
    console.log('good');
})

app.get('/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, result) =>{
    if (err) {
        res.status(500).json({ message: 'Error occurred while retrieving products.', error: err});
    }else {
        res.status(200).json(result);
    }
    })
})

app.get('/products/:id', (req, res) => {
    const Id = req.params.id;
    
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [Id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error occurred while retrieving products.' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        
        res.json(result[0]);
    });
});

app.get('/products/search/:keyword', (req, res) =>{
    const keyword = req.params.keyword;
    const sql = 'SELECT * FROM products WHERE name LIKE ?';
    db.query(sql, [`%${keyword}%`], (err, result) =>{
        if (err) {
            res.status(500).json({ message: 'Error occurred while retrieving products.', error: err});
        }
        if (result.length === 0) {
            return res.status(404).json({message: 'Product not found.'})
        }
        res.json(result);
    })
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})