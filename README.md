jQuery Transformer
======================
JavaScriptでタッチ端末で要素を動かしたり、回転させたり、拡大したりさせるjQueryプラグイン

デモ
------
<a href="http://dev.creatorish.com/demo/transformer/" target="_blank">http://dev.creatorish.com/demo/transformer/</a>

対応端末
------

### 完全対応 ###

+    iPhone
+    iPod Touch
+    iPad

### 部分対応 ###

+    Android

使い方
------

スクリプトを読み込みます。

    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="transformer.js"></script>

動かしたい要素に対して以下のように記述します。

    $(".transform").transformer();

またhead内に以下のようなviewport設定をして、拡大縮小ができないようにしてください。

    meta name="viewport" content="width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />

オプション
------

    $(".transform").transformer({
    	prevent: true,
        trigger: null,
        gesture: true,
        tapDelay: 200,
        holdDelay: 500,
        minScale: NaN,
        maxScale: NaN,
        centering: true,
        transform3d: true,
        stopPropagation: true
    });

+    prevent: true : 要素をタッチしたときにイベントの伝達を停止するかどうかのフラグです。
+    trigger: null : トランスフォームさせるトリガーとなる要素を指定します。例えばdocument.bodyを渡すと、bodyタグ内でのタッチ操作で要素を動かすことができます。
+    gesture: true : 2本指での拡大及び回転をさせるかどうかのフラグです。
+    tapDelay: 200 : ダブルタップイベント発生までの待ち時間（ミリ秒）です。
+    holdDelay: 500 : ホールドイベント発生までの待ち時間（ミリ秒）です。
+    minScale: NaN : gestureがtrueのときに最低縮小率を数値で指定します。
+    maxScale: NaN : gestureがtrueのときに最大縮大率を数値で指定します。
+    centering: true : 要素の基準点を左上から中心にするかどうかのフラグです。
+    transform3d: true : transform3dが扱える端末のときにtransformではなくtransform3dを使うかどうかのフラグです。
+    stopPropagation: true : イベントの伝達を停止するかどうかのフラグです。

グローバル関数
------

このプラグインは要素のdataにtransformer要素が内包されています。  
以下のようにtransformerオブジェクトを取り出し、処理を行うことが出来ます。

    var transformer = jQuery("hoge").data("transform");
    transformer.transform({
        x: 100,
        y: 200,
        scale: 2,
        rotation: 30
    });

+    transform: {x(x位置):0,y(y位置):0,scale(拡大率):1,rotation(回転値):0} : 要素を指定した数値に変形させます。
+    animate: {x(x位置):0,y(y位置):0,scale(拡大率):1,rotation(回転値):0}, time(時間) : 要素を指定した数値にアニメーションして変形させます。

イベント
------

transformerを適用した要素では以下のイベントを取得することができます。

+    touch: 要素に触れたときに発生します
+    drag: 要素に触れた状態で動かすと発生します
+    transform: 2本指で要素に触れて動かすと発生します
+    tap: 要素をタップすると発生します
+    dblTap: 要素を2回連続でタップすると発生します
+    release: drag状態またはhold状態から指を離すと発生します
+    hold: 要素を長押ししたときに発生します

イベントは$(".hoge").bind("hold",function() {});で付加できます。

ライセンス
--------
[MIT]: http://www.opensource.org/licenses/mit-license.php
Copyright &copy; 2012 creatorish.com
Distributed under the [MIT License][mit].

作者
--------
creatorish yuu  
Weblog: <http://creatorish.com>  
Facebook: <http://facebook.com/creatorish>  
Twitter: <http://twitter.jp/creatorish>