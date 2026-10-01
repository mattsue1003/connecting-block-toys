# 連接方塊・立體題庫

愛迪樂｜鍾孟修 職能治療師

適用四孔連接方塊的靜態網站，包含平面 15 題、立體 15 題，以及逐步引導、全螢幕觀看、自由配色和列印題卡。

## 檔案

- `index.html`：網站入口。
- `data.js`：30 題的座標與教學說明。
- `app.js`：3D 模型、引導與全螢幕功能。
- `style.css`、`guide.css`：版面樣式。
- `assets/`：本機 Three.js 模組與材料參考照片。

## GitHub Pages

將這個資料夾內的全部檔案放在儲存庫根目錄。在儲存庫 Settings → Pages，選擇 Deploy from a branch，指定上傳的分支與 / (root)，儲存即可。

## 本機預覽

在這個資料夾執行 `python3 -m http.server 8000`，瀏覽 `http://localhost:8000`。請透過 HTTP 開啟，直接雙擊 HTML 可能無法載入 JavaScript 模組。

模型呈現外觀與排列位置；接頭方向請依實物調整。
