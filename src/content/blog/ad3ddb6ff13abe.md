---
title: "pecl install grpcで大量のwarningメッセージ出た時の対処法"
emoji: "🤫"
type: "tech"
topics:
  - "php"
  - "grpc"
  - "dockerfile"
  - "gnu"
  - "pecl"
published: true
published_at: "2024-12-04 13:40"
updated_at: "2024-12-04 13:40"
publication_name: "studio"
---

## English version

https://dev.to/wadakatu/how-to-handle-excessive-warning-messages-when-running-pecl-install-grpc-44jb

## 多すぎるwarningメッセージは非常に厄介

`pecl install grpc`をすると大量のWarningメッセージが出ます。

```
#7 67.72 /tmp/pear/temp/grpc/src/core/lib/promise/detail/promise_factory.h:174:5: warning: 'always_inline' function might not be inlinable [-Wattributes]

#7 352.5 /tmp/pear/temp/grpc/src/core/lib/event_engine/forkable.h:61:34: warning: 'unused' attribute ignored [-Wattributes]
```

上記のようなメッセージが軽く数百件以上出てきます。
その影響で、Deploy時にCI/CDのログ上限を天元突破して、エラー吐いて落ちるという現象に悩まされていました。

## 原因

warningメッセージの内容で検索をかけると「[GCC, the GNU Compiler Collection](https://gcc.gnu.org/)」がヒットします。

どうやら、これらのWarningはgRPCのソースコードをコンパイルしているコンパイラから発生していそうです。なので、grpc利用者側が直接ソースコードを修正して、warning自体を根本から抑制することは難しい（はず）です。

## 修正方針

GNUコンパイラには、warningメッセージ発生を抑制するためのオプションが複数あるので、それを渡してやれば良さそう。

https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html

しかし、`pecl install grpc`には直接渡せそうにないので、別の方法で渡す必要があります。
（もし`pecl install`で渡せる方法あれば教えてください。泣いて喜びます🥹）

どうしよう....

以下のStackOverflowから天啓を得ました。
`pecl install`が実行してくれている部分を分割して、コンパイルが走る箇所にオプションを渡してやれば良さそうです。

https://stackoverflow.com/a/47120441

また、gRPCは`c++`で書かれているので、`CFLAGS`や`CXXFLAGS`の環境変数にwarning抑制オプションを渡して、コンパイル時に指定してやれば抑制できそうです。

https://wiki.gentoo.org/wiki/GCC_optimization/ja

## 修正内容

Dockerfile内でgRPCをインストールするものと仮定します。

### before

```Dockerfile
RUN pecl install grpc
```

### after

```Dockerfile
RUN pecl download grpc \
  && tar xzf $(ls grpc-*.tgz | head -n 1) \
  && cd $(ls -d grpc-*/ | head -n 1) \
  && phpize \
  && ./configure --with-php-config=/usr/local/bin/php-config \
  && make -e CFLAGS="-Wno-attributes -Wno-unused-parameter -Wno-deprecated-declarations -Wno-return-type" CXXFLAGS="-Wno-attributes -Wno-unused-parameter -Wno-deprecated-declarations -Wno-return-type" \
  && make install
```
afterのコマンドは、ほとんど`pecl install`が内部的に実行している処理と同じです。
中身を分割してみると、`pecl install`は色々やってくれてたんだなと感動しました。

コンパイル時のwarningメッセージが出ていたのは、`make`の部分だったのでここに環境変数（`CFLAGS`, `CXXFLAGS`）を渡しました。

```bash
make -e CFLAGS="-Wno-attributes -Wno-unused-parameter -Wno-deprecated-declarations -Wno-return-type" CXXFLAGS="-Wno-attributes -Wno-unused-parameter -Wno-deprecated-declarations -Wno-return-type"
```

---

ちなみに、`CFLAGS`と `CXXFLAGS`に渡す抑制オプションはどこを見ればわかるかというと、warningメッセージの最後 を見ればOKです。
`[-Wattributes]`や`[-Wunused-parameter]`という表記があると思います。
これらの`-W`の後に`no`をつけて`[-Wno-attributes]`や`[-Wno-unused-parameter]`としてやればOKです。

その他オプションについては以下の記事をご覧ください。

https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html

## 最後に

この対応のおかげで、Warningメッセージ沼からは無事逃げ出すことができました。
しかし、まだCI/CDのログ上限問題は完全に解決という訳にはいきませんでした。
また後日完全解決した方法を別記事にて投稿できればと思います。

この記事を読むことで、一人でも多くの方をgRPCのwarningメッセージ沼から救い出すことができれば嬉しいです🙌