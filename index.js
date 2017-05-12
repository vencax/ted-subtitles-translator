require('dotenv').config({silent: true})
const express = require('express')
const axios = require('axios')
const Parser = require('./parser')
const port = process.env.PORT || 3000

const app = express()

function _download(req, res, next) {
  if (req.query.subtitleurl && req.query.lang) {
    axios(req.query.subtitleurl).then((content) => {
      req.subtitlefile = content.data
      next()
    }).catch(next)
  } else {
    next('subtitleurl and lang query param required')
  }
}
function _parse(req, res, next) {
  const lines = req.subtitlefile.split('\n')
  const lang = req.query.lang || defaultlang
  Parser(lines, lang).then((translated) => {
    res.send(translated)
  }).catch(next)
}
app.get('/', _download, _parse)

function _general_error_handler(err, req, res, next) {
  res.status(err.status || 400).send(err.message || err)
  if (process.env.NODE_ENV !== 'production') {
    console.log('---------------------------------------------------------')
    console.log(err)
    console.log('---------------------------------------------------------')
  }
}
app.use(_general_error_handler)

app.listen(port, () => {
  console.log('gandalf is walkin\' on port ' + port)
})
