// external Libraries
import { create, CancelToken } from "apisauce";

const domain = "https://svdone.com";
const apiKey = "bdb22276-ff60-448b-b0e8-dc4880d2f415";

const apiRequestTimeOut = 30000; // 30 secs

//  Do not change anything after this line if you're not sure about what you're doing.
const api = create({
  baseURL: domain + "/wp-json/rtcl/v1/",
  headers: {
    Accept: "application/json",
    "X-API-KEY": apiKey,
  },
  timeout: apiRequestTimeOut,
});
const setAuthToken = (token) =>
  api.setHeader("Authorization", "Bearer " + token);
const removeAuthToken = () => api.deleteHeader("Authorization");
const setMultipartHeader = () =>
  api.setHeader("Content-Type", "multipart/form-data");
const removeMultipartHeader = () => api.deleteHeader("Content-Type");

export default api;
export {
  setAuthToken,
  removeAuthToken,
  setMultipartHeader,
  removeMultipartHeader,
};
