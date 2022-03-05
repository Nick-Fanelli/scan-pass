import axios from 'axios';

const serverURL = process.env.REACT_APP_MONGODB_DATABASE_URL;

export const server = axios.create({
    baseURL: serverURL
});

// Refresh on Error
server.interceptors.response.use((response) => response, (error) => {
    if(error.response.status === 403)
        window.location.reload();
});