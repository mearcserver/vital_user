$(function(){
      // パラメータを削除する
  // URLを取得
  var url = new URL(window.location.href);
  // URLSearchParamsオブジェクトを取得
  var params = url.searchParams;

  // パラメータの削除
  params.delete('id');

  // アドレスバーのURLからGETパラメータを削除
  history.replaceState('', '', url.pathname);
})