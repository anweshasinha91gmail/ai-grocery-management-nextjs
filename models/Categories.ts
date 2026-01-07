import mongoose, { Schema, models, model } from "mongoose";

const CategoriesSchema = new Schema(
  {
    name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  },
);

const Categories = models.Categories || model("Categories", CategoriesSchema);
export default Categories;
