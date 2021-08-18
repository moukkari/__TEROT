import axios from 'axios'
const baseUrl = 'http://api.kiakkoterot.fi/api/login'

const login = async credentials => {
  console.log('login')
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

const loginService = { login }

export default loginService