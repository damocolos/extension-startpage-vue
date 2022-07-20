import axios from 'axios';

const connection = axios.create({
  baseURL: 'https://resilient-cat-092f6d.netlify.app/.netlify/functions/api',
  // baseURL: 'http://localhost:9000/.netlify/functions/api/',
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
