// Host URL
export const HOST = import.meta.env.VITE_SERVER_URL;

// base path for authentication-related endpoints, like signup and login.
// This base route makes it easier to build specific authentication routes without repeating the main path each time.
export const AUTH_ROUTES = "/api/auth";

// For user signup or login
// combines AUTH_ROUTES with /signup or /login to create a full path 
 // NOTE : This approach is helpful for managing and updating endpoints from a single place if the path structure changes.
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;

export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`;



export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/add-profile-image`;
export const REMOVE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/remove-profile-image`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;


export const CONTACTS_ROUTES = "/api/contacts";

export const SEARCH_CONTACTS_ROUTE = `${CONTACTS_ROUTES}/search`; 