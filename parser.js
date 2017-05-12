const Promise = require('bluebird')
const _ = require('lodash')
const translator = require('./translator')

const timeregex = /[0-9]{2}(:[0-9]{2}){2}.[0-9]{3} --> [0-9]{2}(:[0-9]{2}){2}.[0-9]{3}/

function _parsePrelude(lines, info) {
  const rv = []
  let line = lines[info.currLine]
  info.match = line.match(timeregex)
  while (! info.match && info.currLine < lines.length) {
    rv.push(line)
    info.currLine += 1
    line = lines[info.currLine]
    info.match = line.match(timeregex)
  }
  return rv
}

function _parseTitleGroup(lines, info, speaches, times) {
  times.push(lines[info.currLine])
  info.currLine += 1
  let line = lines[info.currLine]
  info.match = line.match(timeregex)
  while (! info.match && info.currLine < lines.length) {
    speaches.push(line)
    info.currLine += 1
    if (info.currLine === lines.length) {
      break
    }
    line = lines[info.currLine]
    info.match = line.match(timeregex)
  }
}

function _renderTranslation(prelude, times, translations) {
  let currTime = 0

  function _addTime() {
    const time = times[currTime]
    currTime += 1
    return '\n' + time
  }

  return prelude.join('\n') + _.map(translations, i => {
    const rv = [_addTime()]
    _.each(i.transls, (tr) => {
      if (tr.length === 0) {
        rv.push(_addTime())
      } else {
        rv.push(tr)
      }
    })
    return rv.join('\n')
  }).join('\n')
}

module.exports = function(lines, lang) {
  const inPrelude = true
  const info = {
    currLine: 0,
    match: null
  }
  const prelude = _parsePrelude(lines, info)
  const speaches = []
  const times = []
  while (info.match) {
    _parseTitleGroup(lines, info, speaches, times)
  }

  return translator(speaches, lang).then(translations => {
    return _renderTranslation(prelude, times, translations)
  })
}
