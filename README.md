# 現在地QRコード生成

現在地のGoogleマップリンクをQRコードにして、場所の説明つきの画像としてダウンロードできるシンプルな静的Webアプリです。

## 仕組み

- ブラウザの位置情報APIで現在地(緯度・経度)を取得します。
- `https://www.google.com/maps?q=緯度,経度` のリンクをQRコード化します(QRコードはこのリンクのみを符号化します)。
- 場所の説明はQRコード画像の下にテキストとして印字され、1枚のPNG画像としてダウンロードできます。
- QRコード生成は [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) を `qrcode.min.js` としてローカルに同梱しており、外部CDNへの依存はありません。
- ビルド不要の静的ファイル(`index.html` / `style.css` / `app.js` / `qrcode.min.js`)のみで構成されています。

## GitHub Pagesで公開する

1. このフォルダの内容をGitHubリポジトリにpushします。
2. リポジトリの Settings → Pages を開きます。
3. "Source" を対象ブランチ(例: `main`)のルートに設定します。
4. 発行されたURL(`https://<ユーザー名>.github.io/<リポジトリ名>/`)にアクセスします。

位置情報APIはHTTPS(またはlocalhost)でのみ動作するため、GitHub Pagesの発行URLで利用してください。

## ローカルで試す

`index.html` を直接ブラウザで開くだけでも動作しますが、ブラウザによっては `file://` 経由だと位置情報の許可ダイアログが出ない場合があります。その場合は簡易サーバーを立てて `http://localhost/` 経由で開いてください。
