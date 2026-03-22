const express = require('express');
const path = require('path');
require('dotenv').config();
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', productRoutes);

app.use((req, res, next) => {
    res.status(404).render('index', { products: [], searchQuery: '', error: 'Trang không tồn tại' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('index', { products: [], searchQuery: '', error: 'Đã xảy ra lỗi trên server: ' + err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
