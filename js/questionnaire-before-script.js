/**
 * メイン処理
 */
$(function() {
    
    // 日付コンボボックスに当日の日付をセットする。
    setSelectDate();

})


/**
 * 日付選択コンボボックスに当日の日付を表示させる
 */
function setSelectDate() {
    var today = new Date();
    today.setDate(today.getDate());
    var yyyy = today.getFullYear();
    var mm = ("0"+(today.getMonth()+1)).slice(-2);
    var dd = ("0"+today.getDate()).slice(-2);
    document.getElementById("select-date").value = yyyy + '-' + mm + '-' + dd;
}