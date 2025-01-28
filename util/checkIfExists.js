const db = require(`${__dirname}/../db/connection.js`);

exports.checkIfExists = (username, body) => {
  if (username === undefined || body === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  } else {
    return Promise.resolve();
  }
};

exports.checkArticleExists = (article_id) =>{
  if (article_id === undefined){
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    })
  } else {
    const inputQuery = "SELECT * FROM articles WHERE article_id = $1"
    return db.query(inputQuery, [article_id])
    .then(({rows})=>{
      if (rows.length === 0){
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        })
      } else {
        return Promise.resolve()
      }
    })
  }
}

exports.checkValidDataType = (inc_votes)=>{
  if (inc_votes === NaN){
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    })
  } else {
    return Promise.resolve()
  }
}
