const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";

export function setAuthToken(token:string){
    if (typeof window == "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken():string|null {
    if(typeof window == "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken(){
    if (typeof window =="undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
}


export function setAuthRole(role:string){
    if (typeof window == "undefined") return;
    window.localStorage.setItem(ROLE_KEY, role);
}
export function getAuthRole(){
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ROLE_KEY);
}


