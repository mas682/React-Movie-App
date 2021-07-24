
var util = require('util')

var errorMessages = {
  INVALID_FILE_TYPE: 'Invalid file type',
  INVALID_FILE_NAME_LENGTH: 'File name cannot be greater than 100 characters or less than 5 characters',
  SERVER_FILE_NAME_GENERATION_ERROR: 'The server failed to find a unique file name after 5 tries'
}

function FileUploadError (code, field) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = errorMessages[code]
  this.code = code
  if (field) this.field = field
}

util.inherits(FileUploadError, Error)

module.exports = FileUploadError
