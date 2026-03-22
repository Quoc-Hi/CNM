const ProductModel = require('../models/product.model');
const { deleteImageFromS3 } = require('../config/upload');

exports.getProducts = async (req, res) => {
    try {
        const products = await ProductModel.getAllProducts();

        const searchQuery = req.query.search;
        let filteredProducts = products;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredProducts = products.filter(p =>
                p.name && p.name.toLowerCase().includes(lowerQuery)
            );
        }

        res.render('index', {
            products: filteredProducts,
            searchQuery: searchQuery || '',
            error: null
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.render('index', { products: [], searchQuery: '', error: 'Lỗi tải danh sách sản phẩm' });
    }
};

exports.renderAddProduct = (req, res) => {
    res.render('add', { error: null });
};

exports.addProduct = async (req, res) => {
    try {
        const { ID, name, price, quantity } = req.body;

        if (!ID || !name || price <= 0 || quantity < 0) {
            return res.render('add', { error: 'Dữ liệu không hợp lệ. ID và Tên không được rỗng, Giá > 0, Số lượng >= 0' });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = req.file.location;
        } else {
            return res.render('add', { error: 'Vui lòng chọn hình ảnh sản phẩm' });
        }

        const newProduct = {
            ID,
            name,
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            image: imageUrl
        };

        await ProductModel.addProduct(newProduct);
        res.redirect('/');
    } catch (error) {
        console.error('Error adding product:', error);
        res.render('add', { error: 'Lỗi khi thêm sản phẩm: ' + error.message });
    }
};

exports.renderEditProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.getProductById(id);
        if (!product) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }
        res.render('edit', { product, error: null });
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        res.status(500).send('Lỗi máy chủ');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, quantity } = req.body;

        if (!name || price <= 0 || quantity < 0) {
            const product = await ProductModel.getProductById(id);
            return res.render('edit', { product, error: 'Dữ liệu không hợp lệ.' });
        }

        const updates = {
            name,
            price: parseFloat(price),
            quantity: parseInt(quantity, 10)
        };

        if (req.file) {
            updates.image = req.file.location;

            // Delete old image
            const oldProduct = await ProductModel.getProductById(id);
            if (oldProduct && oldProduct.image) {
                await deleteImageFromS3(oldProduct.image);
            }
        }

        await ProductModel.updateProduct(id, updates);
        res.redirect('/');
    } catch (error) {
        console.error('Error updating product:', error);
        const product = await ProductModel.getProductById(req.params.id);
        res.render('edit', { product, error: 'Lỗi cập nhật sản phẩm' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.getProductById(id);

        if (product && product.image) {
            await deleteImageFromS3(product.image);
        }

        await ProductModel.deleteProduct(id);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Lỗi khi xóa sản phẩm');
    }
};
