const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, maxLength: 100 },
});

// Virtual for category's URL
CategoriesSchema.virtual("url").get(function () {
    return `/catalog/category/${this._id}`;
});

// Export model
module.exports = mongoose.model("Categories", CategoriesSchema);
