import axios from 'axios';
import { config } from '../config.js';

const connection = axios.create({
  baseURL: config.serviceSpace.url,
});

export const getSpaceStar = async () => {
  try {
    const res = await connection.get(`spaces/star`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const updateSpaceStar = async (id, data) => {
  try {
    const res = await connection.put(`spaces/star/${id}`, data);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const addSpaceStar = async (data) => {
  try {
    const res = await connection.post(`spaces/star`, data);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(
    -2
  )}-${today.getDate()}`;
};

export const getHistory = async () => {
  try {
    const resp = await connection.post(`history`, {
      token: config.talentaConfig.authCookie,
      date: getTodayDate(),
    });

    if (resp?.data) {
      return resp?.data || [];
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const postLiveAttendance = async (type) => {
  try {
    const resp = await connection.post(`live-attendance`, {
      token: config.talentaConfig.authCookie,
      latitude: config.talentaConfig.latitude,
      longitude: config.talentaConfig.longitude,
      type,
    });

    if (resp?.data) {
      return resp?.data || [];
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};
