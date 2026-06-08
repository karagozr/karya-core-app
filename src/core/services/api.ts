import axios from "axios";
import { showMessage } from "../utils/message-box";


const BASE_URL = () => import.meta.env.MODE === 'development' ? "http://localhost:5000/api" : "https://production.api.com";

const getToken = () => {
  var userData = localStorage.getItem("access-token");
  if (userData === null) return "";
  var user = JSON.parse(userData);

  return user.token;
};


export interface IMessageBoxStatus {
  isActiveSuccess: boolean,
  isActiveError: boolean,
  isActiveWarning: boolean,
  isActiveInfo: boolean
}

export interface ICoreRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: any;
  key?: any;
  isBlob?: boolean;
  msgBox: IMessageBoxStatus;
}

interface IAppBaseRequest {
  url: string;
  msgBox: IMessageBoxStatus;
}

export interface IAppRequestGet extends IAppBaseRequest {
  params?: any;
}
export interface IAppRequestPost extends IAppBaseRequest {
  data?: any;
}
export interface IAppRequestPut extends IAppBaseRequest {
  key?: any;
  data?: any;
}
export interface IAppRequestPatch extends IAppBaseRequest {
  data?: any;
}
export interface IAppRequestDelete extends IAppBaseRequest {
  params?: any;
}



export interface IApiResponse {
  data: any | null;
  message: any;
  success: boolean;
  status: number;
}

const apiCoreResponse = (msgBox: IMessageBoxStatus, data: any, title: string, message: string, success: boolean, status: number): IApiResponse => {
  console.log("API Response:", { data, title, message, success, status },msgBox);

  if (msgBox.isActiveError && !success) {
    showMessage({
      type: 'error',
      message: `${message}`,
      title: title,
      displayTime: 4000,
    });
  } else if (msgBox.isActiveSuccess && success) {
    showMessage({
      type: 'success',
      message: `${message}`,
      title: title,
      displayTime: 4000,
    });
  } else if (msgBox.isActiveWarning && !success) {
    showMessage({
      type: 'warning',
      message: `${message}`,
      title: title,
      displayTime: 4000,
    });
  } else if (msgBox.isActiveInfo) {
    showMessage({
      type: 'info', 
      message: `${message}`,
      title: title,
      displayTime: 4000,
    });
  }
  return {
    data,
    message,
    success,
    status,
  };
};

const CoreRequest = async ({ method, url, data, params, key, isBlob, msgBox }: ICoreRequest): Promise<IApiResponse> => {
  const headers = {
    "Access-Control-Allow-Private-Network": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "origin, content-type, accept, authorization",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
    Authorization: `Bearer ${getToken()}`,
  };

  var config: Partial<ICoreRequest> = {
    url: url,
    method: method
  };


  try {


    if (method === 'GET' || method === 'DELETE') {
      config = {
        ...config,
        params: params
      };
    } else {
      config = {
        ...config,
        data: data
      };
    }

    const result = await axios.request(config);

    const { data: resData, status } = result;

    const message = resData?.message || "Success";

    switch (status) {
      case 200: return apiCoreResponse(msgBox, resData?.resData ?? resData, "Success", message, true, status);
      case 201: return apiCoreResponse(msgBox, resData?.resData ?? resData, "Success", message, true, status);
      case 220: return apiCoreResponse(msgBox, resData?.resData ?? resData, "Success", message, true, status);
      case 204: return apiCoreResponse(msgBox, null, "Success", "No Content", true, status);
      case 400: return apiCoreResponse(msgBox, resData, "Bad Request", message, false, status);
      case 401: return apiCoreResponse(msgBox, resData, "Unauthorized", message, false, status);
      case 403: return apiCoreResponse(msgBox, resData, "Forbidden", message, false, status);
      case 404: return apiCoreResponse(msgBox, resData, "Not Found", message, false, status);
      default:
        return apiCoreResponse(msgBox, resData, "API Warning", message ?? "API Warning", true, status);
    }
  } catch (error: any) {

    const response = error?.response;
    const status = response?.status || 0;
    const data = response?.data;
    const message = data?.message || error?.message || "Sunucu hatası";


    switch (status) {
      case 400: return apiCoreResponse(msgBox, null, "Bad Request", message, false, status);
      case 401: return apiCoreResponse(msgBox, null, "Unauthorized", `${status} - Unauthorized`, false, status);
      case 403: return apiCoreResponse(msgBox, null, "Forbidden", `${status} - Forbidden`, false, status);
      case 404: return apiCoreResponse(msgBox, null, "Not Found", `${status} - Not Found`, false, status);
      case 408: return apiCoreResponse(msgBox, null, "Request Timeout", `${status} - Request Timeout`, false, status);
      case 500: return apiCoreResponse(msgBox, null, "Internal Server Error", `${status} - Internal Server Error`, false, status);
      case 502: return apiCoreResponse(msgBox, null, "Bad Gateway", `${status} - Bad Gateway`, false, status);
      case 503: return apiCoreResponse(msgBox, null, "Service Unavailable", `${status} - Service Unavailable`, false, status);
      case 504: return apiCoreResponse(msgBox, null, "Gateway Timeout", `${status} - Gateway Timeout`, false, status);
      case 409: return apiCoreResponse(msgBox, null, "Conflict", `${status} - Conflict`, false, status);
      case 410: return apiCoreResponse(msgBox, null, "Gone", `${status} - Gone`, false, status);
      case 422: return apiCoreResponse(msgBox, null, "Unprocessable Entity", `${status} - Unprocessable Entity`, false, status);
      case 455: return apiCoreResponse(msgBox, null, "IFS Token Invalid", message || `${status} - IFS Token Invalid`, false, status);
      default: return apiCoreResponse(msgBox, null, "Unknown Error", message || "Bilinmeyen sunucu hatası", false, status);
    }
  }
};


const AppRequestGet = ({ url, params,msgBox }: IAppRequestGet) => CoreRequest({ method: "GET", url, params, msgBox });
const AppRequestPost = ({ url, data,msgBox }: IAppRequestPost) => CoreRequest({ method: "POST", url, data, msgBox });
const AppRequestPut = ({ url, data, key,msgBox }: IAppRequestPut) => CoreRequest({ method: "PUT", url: url + '/' + key, data, msgBox });
const AppRequestPatch = ({ url, data,msgBox }: IAppRequestPatch) => CoreRequest({ method: "PATCH", url, data, msgBox });
const AppRequestDelete = ({ url, params,msgBox }: IAppRequestDelete) => CoreRequest({ method: "DELETE", url, params, msgBox });

const MessageBoxInitialStatus: IMessageBoxStatus = {
  isActiveError: true,
  isActiveSuccess: false,
  isActiveWarning: false,
  isActiveInfo: false
}

export const ApiRequest = {

  Get: async (url: string, params: any,msgBox: IMessageBoxStatus=MessageBoxInitialStatus) => AppRequestGet({ url: url, params: params, msgBox: msgBox }),
  Post: async (url: string, data: any,msgBox: IMessageBoxStatus=MessageBoxInitialStatus) => AppRequestPost({ url: url, data: data, msgBox: msgBox }),
  Put: async (url: string, key: any, data: any,msgBox: IMessageBoxStatus=MessageBoxInitialStatus) => AppRequestPut({ url: url, key: key, data: data, msgBox: msgBox }),
  Delete: async (url: string, key: any,msgBox: IMessageBoxStatus=MessageBoxInitialStatus) => AppRequestDelete({ url: url + '/' + key, params: null, msgBox: msgBox }),
  Patch: async (url: string, data: any,msgBox: IMessageBoxStatus=MessageBoxInitialStatus) => AppRequestPatch({ url: url, data: data, msgBox: msgBox }),
  // Get : async (url:string, params:any) =>AppRequestGet({url:BASE_URL + url, params:params}),
  // Post : async (url:string, data:any) =>AppRequestPost({url:BASE_URL + url, data:data}),
  // Put : async (url:string, key:any, data:any) =>AppRequestPut({url:BASE_URL + url, key:key, data:data}),
  // Delete : async (url:string, params:any) =>AppRequestDelete({url:BASE_URL + url, params:params}),
  // Patch : async (url:string, data:any) =>AppRequestPatch({url:BASE_URL + url, data:data}),
};

