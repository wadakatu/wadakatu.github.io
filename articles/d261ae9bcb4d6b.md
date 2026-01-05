---
title: "sendgrid-nodejsでbaseUrlを変更するときに注意すること"
emoji: "👹"
type: "tech"
topics:
  - "javascript"
  - "typescript"
  - "node"
  - "sendgrid"
  - "sendgridnodejs"
published: true
published_at: "2023-07-31 23:55"
---

# 早速ですが、問題です。

今回満たしたい仕様は以下の通りです。
- SendgridのAPIキーをセット
- baseUrlを　`https://api.sendgrid.com(デフォルト値)` -> `http://dev-sendgrid.example.com`に変更

## 以下のうち、仕様を満たす正しいコードはどちらでしょう？

### ①
```js
import mail from '@sendgrid/mail';
import client from '@sendgrid/client';

client.setDefaultRequest('baseUrl', 'http://dev-sendgrid.example.com');
client.setApiKey(process.env.SENDGRID_API_KEY as string);
mail.setClient(client);
```

### ②

```js
import mail from '@sendgrid/mail';
import client from '@sendgrid/client';

client.setApiKey(process.env.SENDGRID_API_KEY as string);
client.setDefaultRequest('baseUrl', 'http://dev-sendgrid.example.com');
mail.setClient(client);
```

### ヒント
https://github.com/sendgrid/sendgrid-nodejs/blob/main/packages/client/src/classes/client.js


# 正解は...

## ②番が正しいコードです。

理由は以下のソースコードです。

https://github.com/sendgrid/sendgrid-nodejs/blob/b8125d86134157a462c2e24816cfa56677ab76a8/packages/client/src/classes/client.js#L39-L46

### `this.setDefaultRequest('baseUrl', SENDGRID_BASE_URL);`

はい、↑こいつが全ての元凶です。
setApiKey関数を呼び出すと、APIキーをセットした後に、なぜかbaseUrlをデフォルト値にセットします。

したがって、①番の順番で呼び出すと、書き換えたはずの`baseUrl`がデフォルト値に戻ってしまいます。
なので、仕様を満たすには、②番のソースコードの順番で呼び出す必要があります。

1. setApiKey()
2. setDefaultRequest()

### 自分のお気持ち
　`setApiKey`っていう名前やのに、なんでbaseUrlも変更してしまうん・・・？　
 
この変更が入ったコミット・PR見ても、なぜこの変更がされたのか全くわかりませんでした。。
わかる人教えてください。

https://github.com/sendgrid/sendgrid-nodejs/pull/1093/files
