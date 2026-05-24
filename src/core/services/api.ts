import axios from "axios";

const BASE_URL = () => import.meta.env.MODE === 'development' ? "http://localhost:5000/api" : "https://production.api.com";

const getToken = () => {
  var userData = localStorage.getItem("access-token");
  if (userData === null) return "";
  var user = JSON.parse(userData);

  return user.token;
};


export interface ICoreRequest  {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: any;
  key?: any;
  isBlob?: boolean;
}

export interface IAppRequestGet  {
  url: string;
  params?: any;
}
export interface IAppRequestPost  {
  url: string;
  data?: any;
}
export interface IAppRequestPut  {
  url: string;
  key?: any;
  data?: any;
}
export interface IAppRequestPatch  {
  url: string;
  data?: any;
}
export interface IAppRequestDelete  {
  url: string;
  params?: any;
}



export interface IApiResponse  {
    data: any|null;
    message : any;
    success:boolean;
    status:number;
}

const CoreRequest = async ({ method, url, data, params }: ICoreRequest): Promise<IApiResponse> => {
  const headers = {
    "Access-Control-Allow-Private-Network": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers" : "origin, content-type, accept, authorization",
    "Content-Type" : "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
    Authorization: `Bearer ${getToken()}`,
  };

  var config: Partial<ICoreRequest> = {
    url: url,
    method: method
  };
  

  try {
    

    if(method === 'GET' || method === 'DELETE') {
      config = {
        ...config,
        params: params
      };
    } else {
      config = {
        ...config,
        data:data
      };
    }

    console.log('API Request Conf:', config);

    const result = await axios.request(config);

    console.log('API Request Result:', result);

    
    const { data : resData, status } = result;

    const message = resData?.message || "Success";
    
    switch (status) {
      case 200:
        return {
          data: resData?.resData ?? resData,
          message,
          success: true,
          status,
        };
      case 201:
        return {
          data: resData?.resData ?? resData,
          message,
          success: true,
          status,
        };
      case 220:
        return {
          data,
          message,
          success: true,
          status,
        };
      case 204:
        return {
          data,
          message: "Login Error",
          success: false,
          status,
        };
      default:
        return {
          data,
          message: message ?? "API Warning",
          success: true,
          status,
        };
    }
  } catch (error:any) {

    const response = error?.response;
    const status = response?.status || 0;
    const data = response?.data;
    const message = data?.message || error?.message || "Sunucu hatası";


    switch (status) {
      case 400:
        return {
          data: null,
          message: message,
          success: false,
          status:status,
        };
      case 401:
        // localStorage.removeItem("access-token");
        // if (!window.location.href.includes("/login")) window.location.reload();
        return {
          data: null,
          message: `${status} - Unauthorized`,
          success: false,
          status,
        };
      case 403:
        return {
          data: null,
          message: `${status} - Forbidden`,
          success: false,
          status,
        };
      case 404:
        return {
          data: null,
          message: message || `${status} - Record Not Found`,
          success: false,
          status,
        };
      case 408:
        return {
          data: null,
          message: `${status} - Timeout Error`,
          success: false,
          status,
        };
      case 409:
        return {
          data: null,
          message: message || `${status} - Record already exists`,
          success: false,
          status,
        };
      case 455:
        return {
          data: null,
          message: message || `${status} - IFS Token Invalid`,
          success: false,
          status,
        };
      default:
        return {
          data: null,
          message: message || "Bilinmeyen sunucu hatası",
          success: false,
          status,
        };
    }
  }
};

const AppRequestGet = ({url,params}:IAppRequestGet) => CoreRequest({method:"GET", url, params});
const AppRequestPost = ({url,data}:IAppRequestPost) => CoreRequest({method:"POST", url, data});
const AppRequestPut = ({url,data,key}:IAppRequestPut) => CoreRequest({method:"PUT", url:url+'/'+key, data});
const AppRequestPatch = ({url,data}:IAppRequestPatch) => CoreRequest({method:"PATCH", url, data});
const AppRequestDelete = ({url,params}:IAppRequestDelete) => CoreRequest({method:"DELETE", url, params});

export const ApiRequest = {

    Get : async (url:string, params:any) =>AppRequestGet({url:url, params:params}),
    Post : async (url:string, data:any) =>AppRequestPost({url:url, data:data}),
    Put : async (url:string, key:any, data:any) =>AppRequestPut({url:url, key:key, data:data}),
    Delete : async (url:string, key:any) =>AppRequestDelete({url:url+'/' + key, params:null}),
    Patch : async (url:string, data:any) =>AppRequestPatch({url:url, data:data}),

    // Get : async (url:string, params:any) =>AppRequestGet({url:BASE_URL + url, params:params}),
    // Post : async (url:string, data:any) =>AppRequestPost({url:BASE_URL + url, data:data}),
    // Put : async (url:string, key:any, data:any) =>AppRequestPut({url:BASE_URL + url, key:key, data:data}),
    // Delete : async (url:string, params:any) =>AppRequestDelete({url:BASE_URL + url, params:params}),
    // Patch : async (url:string, data:any) =>AppRequestPatch({url:BASE_URL + url, data:data}),
};

