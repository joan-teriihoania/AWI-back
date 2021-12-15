module.exports = {
    exec: function(req, res){
        res.cookie("JZ-Translation-auth", "")
        res.status(200)
        res.end()
    }
}