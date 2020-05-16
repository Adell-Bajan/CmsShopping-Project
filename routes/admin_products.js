const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');




// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');


// Get pages index
router.get('/', function(req, res) {
    var count;
    Product.count(function(err, c) {
        count = c;
    });
    Product.find(function(err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});


// Get add product
router.get('/add-product', function(req, res) {
    var title = "";
    var desc = "";
    var price = "";
    Category.find(function(err, categories) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price,
        });
    })

});





// Post add product
router.post('/add-product', function(req, res) {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    const { title, slug, desc, price, category } = req.body;
    let errors = [];
    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }
    if (!desc) {
        errors.push({ msg: 'Description must have a value' });
    }
    if (!image) {
        errors.push({ msg: 'You must upload an image' });
    }
    if (errors.length > 0) {
        res.render('admin/add_product', {
            errors: errors,
            title: title,
            desc: desc,
            category: category,
            price: price,
        });
    } else {
        // Validation passed
        Product.findOne({ slug: slug })
            .then(product => {
                if (product) {
                    // User exists
                    errors.push({ msg: 'Product title exists, chose another.' });
                    res.render('admin/add_product', {
                        errors: errors,
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price,
                    });
                } else {
                    const price2 = parseFloat(price).toFixed(2);

                    const product = new Product({
                        title,
                        slug,
                        desc,
                        price: price2,
                        category,
                        image: imageFile
                    });
                    product.save()
                        .then(product => {
                            mkdirp('public/product_images/' + product._id, function(err) {
                                return console.log(err);
                            });
                            mkdirp('public/product_images/' + product._id + '/gallery', function(err) {
                                return console.log(err);
                            });
                            mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function(err) {
                                return console.log(err);
                            });
                            if (imageFile != "") {
                                const productImage = req.files.image;
                                const path = 'public/product_image/' + product._id + '/' + imageFile;

                                productImage.mv(path, function(err) {
                                    return console.log(err);
                                });
                            }
                            req.flash('success_msg', 'Product added!');
                            res.redirect('/admin/products');
                            console.log(page);
                        })
                        .catch(err => console.log(err));
                }
            })
    }
});




// POST reorder index
router.post('/reorder-pages', function(req, res) {
    const ids = req.body['id[]'];

    const count = 0;
    for (const i = 0; i < ids.length; ++i) {
        const id = ids[i];
        count++;

        ((count) => {
            page.findById(id, (err, page) => {
                page.sorting = count;
                page.save((err) => {
                    if (err)
                        return console.log(err)
                });
            });
        })(count);
    }
});


// Get edit page
router.get('/edit-page/:id', (req, res) => {
    Page.findById(req.params.id).then((page) => {
        if (!page) { //if page not exist in db
            return res.status(404).send('Page not found');
        }

        res.render('admin/edit_page', { //page  exist
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    }).catch((e) => { //bad request 
        res.status(400).send(e);
    });
});




// Post edit page
router.post('/edit-page/:id', (req, res) => {
    const { title, slug, content, id } = req.body;
    let errors = [];
    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }
    if (!slug) {
        errors.push({ msg: 'Slug must have a value' });
    }
    if (!content) {
        errors.push({ msg: 'Content must have a value' });
    }
    if (errors.length > 0) {
        res.render('admin/edit_page', {
            errors,
            title,
            slug,
            content,
            id,
        });
    } else {
        // Validation passed
        Page.findOne({ slug: slug, _id: { '$ne': id } })
            .then(page => {
                if (page) {
                    // User exists
                    errors.push({ msg: 'Page slug exists, chose another.' });
                    res.render('admin/edit_page', {
                        errors,
                        title,
                        slug,
                        content,
                        id,
                    });
                } else {

                    Page.findById(id, function(err, page) {
                        if (err)
                            return console.log(err);
                        page.title = title;
                        page.slug = slug;
                        page.content = content;
                        page.save()
                            .then(page => {
                                req.flash('success_msg', 'Edit page success!');
                                res.redirect('/admin/pages/edit-page/' + id);
                                console.log(page);
                            })
                            .catch(err => console.log(err));
                    });
                }
            });


    }
});



// Get delete page
router.get('/delete-page/:id', function(req, res) {
    Page.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            return console.log(err)
        req.flash('success_msg', 'Page deleted success!');
        res.redirect('/admin/pages/');
    })
});



// Exports
module.exports = router;