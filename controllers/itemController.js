const Item = require("../models/items");
const Category = require("../models/categories");

const async = require("async");


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
        .populate("name")
        .exec(function (err, list_items) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render("grocery_list", { title: "Grocery List", items_list: list_items });
        });
};

// Display detail page for a specific item.
exports.item_detail = (req, res) => {
    res.send(`NOT IMPLEMENTED: item detail: ${req.params.id}`);
};

// Display item create form on GET.
exports.item_create_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Item create GET");
};

// Handle item create on POST.
exports.item_create_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Item create POST");
};

// Display item delete form on GET.
exports.item_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Item delete GET");
};

// Handle item delete on POST.
exports.item_delete_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Item delete POST");
};

// Display item update form on GET.
exports.item_update_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Item update GET");
};

// Handle item update on POST.
exports.item_update_post = (req, res) => {
    res.send("NOT IMPLEMENTED: Item update POST");
};