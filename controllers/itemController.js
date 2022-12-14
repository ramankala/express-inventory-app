const Item = require("../models/items");

exports.index = (req, res) => {
    res.send("NOT IMPLEMENTED: Site Home Page");
};

// Display list of all items.
exports.item_list = (req, res) => {
    res.send("NOT IMPLEMENTED: Item list");
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
exports.book_delete_get = (req, res) => {
    res.send("NOT IMPLEMENTED: Book delete GET");
};
