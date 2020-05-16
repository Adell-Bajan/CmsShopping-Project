const express = require('express');
const router = express.Router();




// Get Category model
const Category = require('../models/category');



// Get Category index
router.get('/', function(req, res) {
    Category.find(function(err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        })

    });
});


// Get add category
router.get('/add-category', function(req, res) {
    var title = "";
    res.render('admin/add_category', {
        title: title
    });
});



// Post add category
router.post('/add-category', function(req, res) {
    const { title, slug, content } = req.body;
    let errors = [];
    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }
    // if (!slug) {
    //     errors.push({ msg: 'Slug must have a value' });
    // }
    // if (!content) {
    //     errors.push({ msg: 'Content must have a value' });
    // }
    if (errors.length > 0) {
        res.render('admin/add_category', {
            errors,
            title,
            slug,
            content,
        });
    } else {
        // Validation passed
        Category.findOne()
            .then(category => {
                if (category) {
                    // User exists
                    errors.push({ msg: 'Category title exists, chose another.' });
                    res.render('admin/add_category', {
                        errors,
                        title,
                        slug,
                        content,
                    });
                } else {
                    const category = new Category({
                        title,
                        slug,
                        content,
                    });
                    category.save()
                        .then(category => {
                            req.flash('success_msg', 'Category added!');
                            res.redirect('/admin/categories');
                            console.log(category);
                        })
                        .catch(err => console.log(err));
                }
            })
    }
});

// // Post add category
// router.post('/add-category', function(req, res) {
//     const { title, slug } = req.body;
//     let errors = [];
//     if (!title) {
//         errors.push({ msg: 'Title must have a value' });
//     }
//     if (errors.length > 0) {
//         res.render('admin/add_category', {
//             errors,
//             title,
//             slug,
//         });
//     } else {
//         // Validation passed
//         Category.findOne({ slug: slug })
//             .then(category => {
//                 if (category) {
//                     // User exists
//                     errors.push({ msg: 'Page slug exists, chose another.' });
//                     res.render('admin/add_category', {
//                         errors,
//                         title,
//                         slug,
//                     });
//                 } else {
//                     const category = new Category({
//                         title,
//                         slug
//                     });
//                     category.save()
//                         .then(page => {
//                             req.flash('success_msg', 'Category added!');
//                             res.redirect('/admin/pages');
//                             console.log(page);
//                         })
//                         .catch(err => console.log(err));
//                 }
//             })
//     }
// });





// Get edit category
router.get('/edit-category/:id', (req, res) => {
    Category.findById(req.params.id).then((category) => {
        if (!category) { //if page not exist in db
            return res.status(404).send('Category not found');
        }

        res.render('admin/edit_category', { //page  exist
            title: category.title,
            id: category._id
        });
    }).catch((e) => { //bad request 
        res.status(400).send(e);
    });
});




// Post edit category
router.post('/edit-category/:id', (req, res) => {
    const { title, slug } = req.body;
    const id = req.params.id;
    let errors = [];
    if (!title) {
        errors.push({ msg: 'Title must have a value' });
    }
    if (errors.length > 0) {
        res.render('admin/edit_category', {
            errors,
            title,
            id,
        });
    } else {
        // Validation passed
        Category.findOne({ slug: slug, _id: { '$ne': id } })
            .then(category => {
                if (category) {
                    // User exists
                    errors.push({ msg: 'Category slug exists, chose another.' });
                    res.render('admin/edit_category', {
                        errors,
                        title,
                        id,
                    });
                } else {

                    Category.findById(id, function(err, category) {
                        if (err)
                            return console.log(err);
                        category.title = title;
                        category.slug = slug;
                        category.save()
                            .then(category => {
                                req.flash('success_msg', 'Edit category success!');
                                res.redirect('/admin/categories/edit-category/' + id);
                                console.log(category);
                            })
                            .catch(err => console.log(err));
                    });
                }
            });


    }
});



// Get delete Category
router.get('/delete-category/:id', function(req, res) {
    Category.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            return console.log(err)
        req.flash('success_msg', 'Category deleted success!');
        res.redirect('/admin/categories/');
    })
});



// Exports
module.exports = router;