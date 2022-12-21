const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: [{ type: mongoose.Types.ObjectId, ref: "Categories", required: true }],
    price: { type: Number, min: 0, max: 1000000, required: true },
    numInStock: { type: Number, min: 0, max: 999, required: true },
})

// Virtual for item URL

ItemSchema.virtual("url").get(function () {
    //We don't use an arrow function as we'll need this object
    return `/catalog/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Items", ItemSchema);