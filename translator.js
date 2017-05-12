
const phantomjs = require('phantomjs-prebuilt')
const webdriverio = require('webdriverio')
const urlencode = require('urlencode')
const _ = require('lodash')
const wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }

const BASE_URL = 'https://translate.google.cz'
const MAX_GROUP_SIZE = 4000

function _translatePart(lang, resultObj) {
  const url = `${BASE_URL}/#en/${lang}/${urlencode(resultObj.part)}`

  return phantomjs.run('--webdriver=4444')
  .then(program => {
    const driver = webdriverio.remote(wdOpts).init()
    const htmlPromise = driver
      .url(url)
      .pause(4000)
      .getHTML('#result_box span', false)
    return htmlPromise
  })
  .then(lines => {
    const endingLineReqex = /(.+)<br><br>$/
    const regularLineReqex = /(.+)<br>$/
    const rv = []
    let m
    _.each(lines, l => {
      m = l.match(endingLineReqex)
      if (m) {
        rv.push(m[1])
        return rv.push('')
      }
      m = l.match(regularLineReqex)
      if (m) {
        rv.push(m[1])
      } else {
        rv.push(l)
      }
    })
    resultObj.transls = rv
  }).catch(err => {
    // do nothing
  })
}

function _retry(failed, lang, results) {
  const promises = _.map(failed, f => _translatePart(lang, f))
  return Promise.all(promises).then(() => {
    let failed = _.filter(results, i => i.transls === undefined)
    if (failed.length > 0) {
      return _retry(failed, results, lang)
    }
    return _.sortBy(results, 'idx')
  })
}

module.exports = function(speaches, lang) {

  let currTranslGroupSize = 0
  let currTranslGroup = [], idx = 0
  const promises = []
  const results = []

  _.each(speaches, (line) => {
    if ( line.length === 0 && (currTranslGroupSize + line.length) >= MAX_GROUP_SIZE) {
      const o = {
        idx: idx,
        part: currTranslGroup.join('\n')
      }
      results.push(o)
      promises.push(_translatePart(lang, o))
      idx += 1
      currTranslGroupSize = 0
      currTranslGroup = []
    }
    currTranslGroup.push(line)
    currTranslGroupSize += line.length
  })
  // yet the rest
  const o = {
    idx: idx,
    part: currTranslGroup.join('\n')
  }
  results.push(o)
  promises.push(_translatePart(lang, o))

  return Promise.all(promises).then(() => {
    let failed = _.filter(results, i => i.transls === undefined)
    if (failed.length > 0) {
      return _retry(failed, lang, results)
    }
    return _.sortBy(results, 'idx')
  })
}

process.on('exit', function (){
  program.kill() // quits PhantomJS
});
