import React from 'react';
import axios from 'axios';

const serverURL = process.env.REACT_APP_MONGODB_DATABASE_URL;

export const server = axios.create({
    baseURL: serverURL
});