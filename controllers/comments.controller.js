const { deleteCommentByID } = require("../models/comments.model")


exports.deleteComment = (request, response, next)=>{
    const {comment_id} = request.params
    deleteCommentByID(comment_id)
    .then(()=>{
        response.status(204).send()
    })
    .catch((err)=>{
        next(err)
    })
}