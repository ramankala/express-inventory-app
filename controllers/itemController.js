const Item = require("../models/items");
const Category = require("../models/categories");

const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
    async.parallel(
        {
            item_count(callback) {
                Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
            },
            category_count(callback) {
                Category.countDocuments({}, callback);
            },
        },
        (err, results) => {
            res.render("index", {
                title: "Grocery App",
                error: err,
                data: results,
            });
        }
    );
};

// Display list of all items.
exports.item_list = (req, res) => {
    Item.find({}, "name numInStock price")
        .sort({ name: 1 })
        .populate("category")
        .exec(function (err, list_items) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render("item_list", { title: "Grocery List", items_list: list_items });
        });
};

// Display detail page for a specific item.
exports.item_detail = (req, res) => {
    Item.findById(req.params.id)
        .populate("category")
        .exec(function (err, results) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render("food_detail", {
                title: results.name,
                food: results,
            });
        });
};

// Display item create form on GET.
exports.item_create_get = (req, res) => {
    async.parallel(
        {
            categories(callback) {
                Category.find(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            res.render("item_form", {
                title: "Create Food Item",
                categories: results.categories
            });
        }
    );
};

// Handle item create on POST.
exports.item_create_post = [
    // Convert categories to an array
    (req, res, next) => {
        if (!Array.isArray(req.body.categories)) {
            req.body.categories = typeof req.body.categories === "undefined" ? [] : [req.body.categories];
        }
        next();
    },

    //Validate and sanitize fields.
    body("name", "Name must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("price", "Price must not be empty")
        .trim()
        .isInt({min: 0, max: 1000000})
        .escape(),
    body("numInStock", "# in stock must not be empty")
        .trim()
        .isInt({min: 0, max: 999})
        .escape(),
    body("categories.*").escape(),

    // Process request after validation and sanization.
    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            numInStock: req.body.numInStock,
            category: req.body.categories,
        });
        if (!errors.isEmpty()) {

            async.parallel(
                {
                    categories(callback) {
                        Category.find(callback);
                    }
                },
                (err, results) => {
                    if (err) {
                        return next (err);
                    }

                    // Mark our selected categories as checked.
                    for (const category of results.categories) {
                        if (item.category.includes(category._id)) {
                            category.checked = true;
                        }
                    }

                    res.render("item_form", {
                        title: "Create Food Item",
                        categories: results.categories,
                        item,
                        errors: errors.array(),
                    });
                }
            );
            return;
        }
        
        item.save((err) => {
            if (err) {
                return next(err);
            }
            //Successful: redirect to new item record.
            res.redirect(item.url);
        });
    },
];

// Display item delete form on GET.
exports.item_delete_get = (req, res, next) => {
    Item.findById(req.params.id)
        .populate("category")
        .exec(function (err, items) {
            if (err) {
                return next(err);
            }
            if (items == null) {
                // No results
                res.redirect("/catalog/items");
            }
            // Successful, so render.
            res.render("item_delete", {
                title: "Delete Item",
                item: items,
            });
        });
};

// Handle item delete on POST.
exports.item_delete_post = (req, res, next) => {
    Item.findByIdAndRemove(req.body.foodid, function deleteItem(err) {
        if (err) {
            return next(err);
        }
        // Success, so redirect to list of items.
        res.redirect("/catalog/items");
    });
};

// Display item update form on GET.
exports.item_update_get = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id)
                    .populate("category")
                    .exec(callback);
            },
            category(callback) {
                Category.find(callback);
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.item == null) {
                const err = new Error("Item not found");
                err.status = 404;
                return next(err);
            }
            //Success
            //Mark our selected categories as checked.
            for (const category of results.category) {
                for (const itemCategory of results.item.category) {
                    if (category._id.toString() === itemCategory._id.toString()) {
                        category.checked = "true";
                    }
                }
            }
            res.render("item_form", {
                title: "Update Food",
                item: results.item,
                categories: results.category,
            });
        }
    );
};

// Handle item update on POST.
exports.item_update_post = [
    // Convert the category to an array
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category];
        }
        next();
    },

    body("name", "Name must not be empty.")
        .trim()
        .isLength({min:1})
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({min:1})
        .escape(),
    body("price","Price must not be empty.")
        .trim()
        .isInt({min: 0, max: 1000000})
        .escape(),
    body("numInStock", "Num in stock must not be empty.")
        .trim()
        .isInt({min: 1, max: 999})
        .escape(),
    body("categories.*").escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            numInStock: req.body.numInStock,
            category: typeof req.body.category === "undefined" ? [] : req.body.categories,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            async.parallel(
                {
                    category(callback) {
                        Category.find(callback);
                    },
                },
                (err, results) => {
                    if (err) {
                        return next(err);
                    }

                    for (const categories of results.category) {
                        if (item.category.includes(categories._id)) {
                            categories.checked = "true";
                        }
                    }
                    res.render("item_form", {
                        title: "Update Food",
                        category: results.category,
                        item: item,
                        errors: errors.array(),
                    });
                }
            );
            return;
        }
        Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
            if (err) {
                return next(err);
            }

            res.redirect(theitem.url);
        });
    },
];