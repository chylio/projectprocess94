import type { VercelRequest, VercelResponse } from '@vercel/node';

// 從 Vercel 環境變數取得你鎖死的 Master Key
const API_MASTER_KEY = process.env.API_MASTER_KEY;

// 你的 JSONBin 目標 Bin ID（請換成自己的，否則下面無法正確運作）
const JSONBIN_BIN_ID = '你的_JSONBin_BIN_ID'; // TODO: 這邊換成自己的 bin id
const JSONBIN_API = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// 主程式
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ========== Step 1: 檢查 x-master-key ==========
  // 注意 header key 全部要小寫
  const clientKey = (req.headers['x-master-key'] || req.headers['X-Master-Key']) as string | undefined;
  if (!API_MASTER_KEY || clientKey !== API_MASTER_KEY) {
    return res.status(403).json({ error: 'Forbidden: invalid API key.' });
  }

  // ========== Step 2: 支援 GET/PUT ==========
  // 支援讓前端讀資料(GET)，或寫資料(PUT)
  try {
    // 讀資料
    if (req.method === 'GET') {
      const response = await fetch(`${JSONBIN_API}/latest`, {
        headers: { 'X-Master-Key': API_MASTER_KEY }
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }
    // 寫資料
    if (req.method === 'PUT') {
      const response = await fetch(JSONBIN_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_MASTER_KEY
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
