import axios from "axios";
import { HOST } from "../utils/constants";

// axios instance with base URL option set
// any request made using apiClient will automatically prepend to this
// base URL to the request path.
const apiCLient = axios.create({
  baseURL: HOST,
});

export default apiCLient;
