import React from 'react'
import "./ErrorMessage.css"
function ErrorMessage({message}) {
  return (
    <div id="passwordError" class="error-message">{message}</div>
  )
}

export default ErrorMessage