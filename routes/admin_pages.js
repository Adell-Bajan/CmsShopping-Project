const express = require('express');
const router = express.Router();




// Get Page model
const Page = require('../models/page');



// Get pages index
router.get('/', function(req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function(err, pages) {
        res.render('admin/pages', {
            pages: pages
        });
    });
});


// Get add page
router.get('/add-page', function(req, res) {
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add_page', {
        // title: 'Admin Area',
        title: title,
        slug: slug,
        content: content,
    });
});





// Post add page
router.post('/add-page', function(req, res) {
    const { title, slug, content } = req.body;
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
        res.render('admin/add_page', {
            errors,
            title,
            slug,
            content,
        });
    } else {
        // Validation passed
        Page.findOne({ slug: slug })
            .then(page => {
                if (page) {
                    // User exists
                    errors.push({ msg: 'Page slug exists, chose another.' });
                    res.render('admin/add_page', {
                        errors,
                        title,
                        slug,
                        content,
                    });
                } else {
                    const page = new Page({
                        title,
                        slug,
                        content,
                        sorting: 100
                    });
                    page.save()
                        .then(page => {
                            req.flash('success_msg', 'Page added!');
                            res.redirect('/admin/pages');
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