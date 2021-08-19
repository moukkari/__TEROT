const info = (...params) => {
  const timestamp = new Date().toLocaleString()
  const format = '\x1b[2m\x1b[36m%s\x1b[33m%s\x1b[0m\x1b[32m%s\x1b[0m'
  console.log(format, timestamp, ' - ', ...params)
}

const error = (...params) => {
  const timestamp = new Date().toLocaleString()
  const format = '\x1b[2m\x1b[33m%s%s\x1b[0m\x1b[31m%s\x1b[0m'
  console.error(format, timestamp, ' - ', ...params)
}

module.exports = {
  info, error
}