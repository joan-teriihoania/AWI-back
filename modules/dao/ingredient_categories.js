const db = require("../db");

function editIngredientCategory(ingredient_category_id, arr){
    return db.update("ingredient_categories", arr, "ingredient_category_id = " + ingredient_category_id)
}

function deleteIngredientCategory(ingredient_category_id){
    return db.run("DELETE FROM ingredient_categories WHERE ingredient_category_id = ?", [ingredient_category_id])
}

function createIngredientCategory(name){
    return db.insert("ingredient_categories", [
        {
            name: name
        }
    ])
}

function getIngredientCategory(ingredient_category_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM ingredient_categories WHERE ingredient_category_id = ?", [ingredient_category_id], (ingredient_categories) => {
            if(ingredient_categories && ingredient_categories.length > 0){
                resolve(ingredient_categories[0])
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getIngredientCategory,
    createIngredientCategory,
    deleteIngredientCategory,
    editIngredientCategory
}