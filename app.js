require('dotenv').config();
const express = require('express')
const app = express();
const mysql = require('mysql2');
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser")

app.use(express.json());
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
app.use(bodyParser.json());


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
    
    const sql = 'SELECT * FROM products WHERE id = ? AND is_deleted = 0';
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
    const sql = 'SELECT * FROM products WHERE name LIKE ? AND is_deleted = 0';
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

app.post('/products', (req, res) => {
    const { name, price, discount, review_count, image_url } = req.body;
    db.query(
        'INSERT INTO products (name, price, discount, review_count, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, price, discount, review_count, image_url],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: result.insertId, message: 'Product created' });
        }
    );
})

app.put('/products/:id', (req, res) => {
    const { name, price, discount, review_count, image_url } = req.body;
    db.query(
        'UPDATE products SET name = ?, price = ?, discount = ?, review_count = ?, image_url = ? WHERE id = ?',
        [name, price, discount, review_count, image_url, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated'})
        }
    )
})

app.put('/products/restore/:id', (req, res) => {
    db.query(
        'UPDATE products SET is_deleted = 0 WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message});
            res.json({ message: 'Product restored'});
        }
    )
})

app.delete('/products/:id', (req, res) => {
    db.query(
        'UPDATE products SET is_deleted = 1 WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message});
            res.json({ message: 'Product soft-deleted'});
        }
    )
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
