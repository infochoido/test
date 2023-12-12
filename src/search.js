// api/search.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { key, q, advanced, method } = req.query;
  const apiUrl = `https://opendict.korean.go.kr/api/search?key=${key}&q=${q}&advanced=${advanced}&method=${method}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('API에서 데이터 가져오기 오류:', error);
    res.status(500).send('내부 서버 오류');
  }
}
