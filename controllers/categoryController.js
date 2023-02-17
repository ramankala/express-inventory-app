const Category = require("../models/categories");
const Item = require("../models/items");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Categories.
exports.category_list = (req, res) => {
    Category.find()
        .sort([["name", "ascending"]])
        .exec(function(err, list_categories) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render("category_list", {
                title: "Grocery Aisle",
                category_list: list_categories,
            });
        });
};

// Display detail page for a specific Category.
exports.category_detail = (req, res) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },

            category_items(callback) {
                Item.find({ category: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.category == null) {
                // No results.
                const err = new Error("Category not found");
                err.status = 404;
                return next(err);
            }
            // Successful, so render
            res.render("category_detail", {
                title: "Category Detail",
                category: results.category,
                category_items: results.category_items,
            });
        }
    );
};

// Display Category create form on GET.
exports.category_create_get = (req, res) => {
    res.render("category_form", { title: "Create Category" });
};

// Handle Category create on POST.
exports.category_create_post = [
    // Validate and sanitize the name field.
    body('name', 'Empty name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Name must be specified'),
    body('description', 'Empty description')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Description must be specified'),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', {
          title: 'Create Category',
          category: req.body,
          errors: errors.array(),
        });
        return;
      }
        // Data from form is valid.
        // Check if Category with same name already exists.
        Category.findOne({ name: req.body.name }).exec((err, found_category) => {
          if (err) {
            return next(err);
          }
  
          if (found_category) {
            // Category exists, redirect to its detail page.
            res.redirect(found_category.url);
          } else {
            // Create a genre object with escaped and trimmed data.
            const category = new Category({
                name: req.body.name,
                description: req.body.description
            });
            category.save((err) => {
              if (err) {
                return next(err);
              }
              // Category saved. Redirect to category detail page.
              res.redirect(category.url);
            });
          }
        });
    },
  ];
  

// Display Category delete form on GET.
exports.category_delete_get = (req, res) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            items(callback) {
                Item.findById({ category: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.category == null) {
                res.redicrect("/catalog/categories");
            }
            res.render("category_delete", {
                title: "Delete Category",
                category: results.category,
                items: results.items,
            });
        }
    );
};

// Handle Category delete on POST.
exports.category_delete_post = (req, res) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.body.categoryid).exec(callback);
            },
            items(callback) {
                Item.findById({ category: req.body.categoryid }).exec(callback);
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            // Success
            if (results.items.length > 0) {
                // Category has items. Render in the same way as GET route.
                res.render("category_delete", {
                    title: "Delete Category",
                    category: results.category,
                    items: results.items,
                });
                return;
            }
            // Category has no items.  Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.categoryid, (err) => {
                if (err) {
                    return next(err);
                }
                // Success - go to categories list
                res.redirect("/catalog/categories");
            });
        }
    );
};

// Display Category update form on GET.
exports.category_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Category update GET");
};

// Handle Category on POST.
exports.category_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Category update POST");
};