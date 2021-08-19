import axios from 'axios'
import { APIURL } from '../services/addresses'


const login = async credentials => {
  console.log('login')
  const response = await axios.post(`${APIURL}/login`, credentials)
  return response.data
}

const loginService = { login }

export default loginService