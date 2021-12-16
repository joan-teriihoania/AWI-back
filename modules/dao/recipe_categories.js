const db = require("../db");


function editRecipeCategory(recipe_category_id, arr){
    return db.update("recipe_categories", arr, "recipe_category_id = " + recipe_category_id)
}

function deleteRecipeCategory(recipe_category_id){
    return db.run("DELETE FROM recipe_categories WHERE recipe_category_id = ?", [recipe_category_id])
}

function createRecipeCategory(name){
    return db.insert("recipe_categories", [
        {
            name: name
        }
    ])
}

function getRecipeCategory(recipe_category_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipe_categories WHERE recipe_category_id = ?", [recipe_category_id], (recipe_categories) => {
            if(recipe_categories && recipe_categories.length > 0){
                resolve(recipe_categories[0])
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getRecipeCategory,
    createRecipeCategory,
    deleteRecipeCategory,
    editRecipeCategory
}