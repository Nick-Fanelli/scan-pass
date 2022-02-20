import React from 'react';
import axios from 'axios';

export const server = axios.create({
    baseURL: process.env.MONGODB_DATABASE_URL
});