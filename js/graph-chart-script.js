
/* 基本情報 */

// ▼post の送り先（url）
var url = "https://a9n10048ea.execute-api.ap-northeast-1.amazonaws.com/demo-post-graph-data"; // <- デモ用 DB アクセス

// ▼ログイン者
var login_person = '';

// ▼閾値（状態のパーセンテージ）
var _warning = 50;
var _danger = 80;

// ▼ステータス表示用パーセンテージ
var _percent = {
  hr: 0,
  pwbgt: 0,
  ee: 0
};

// ▼警告・危険値（各データの）
var _alert = {
  // pwbgt
  pwbgt: {
    danger: 37.4,
    warning: 36.5,
  },
  // 心拍数
  hr: {
    danger: 93,
    warning: 82.5, 
  },
  // 活動量
  ee: {
    danger: 3200,
    warning: 2000
  }
}; 

// グラフの種類
var nearest_select_graphs = [{
  type: 'pwbgt',
  name: 'PWBGT',
},
{
  type: 'hr',
  name: '心拍数',
},
{
  type: 'ee',
  name: '活動量',
},
{
  type: 'iee',
  name: '累計活動量',
}];

// 直近グラフで選択されている項目
var nearest_comb_selected = nearest_select_graphs[0].type;



/* Apexグラフ表示関係 */

// 直近グラフ用 データ
var nearest_series = {
  pwbgt: [ [ 0, 0 ] ],
  hr: [ [ 0, 0 ] ],
  ee: [ [ 0, 0 ] ],
  iee: [ [ 0, 0 ] ]
};

// ApexCharts カテゴリー用
// var category_data = [];

// Chart.js用 グラフデータ
/*
var pwbgt_data = [30,40,35,50,49,60,70,91,125];
var hr_data = [30,40,35,50,49,60,70,91,125];
var ee_data = [30,40,35,50,49,60,70,91,125];
var iee_data = [30,40,35,50,49,60,70,91,125];
*/



/**Line Chart 関係 */

// ▼zoom chart option
var zoom_options = {
  series: [{
    data: [0]
  }],
    chart: {
    id: 'zoom-chart',
    type: 'area',
    height: 520,
    toolbar: {
      autoSelected: 'pan',
      show: false
    }
  },
  annotations: {
    yaxis: [
      {
        y: _alert.pwbgt.warning,
        y2: _alert.pwbgt.danger,
        borderColor: '#ffff00',
        fillColor: '#ffff00',
        label: {
          //text: '警告エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#f6c23e',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      },
      { 
        y: _alert.pwbgt.danger,
        y2: _alert.pwbgt.danger + 50,
        borderColor: '#ff0000',
        fillColor: '#ff0000',
        label: {
          //text: '危険エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#e74a3b',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      }
    ]
  },
  stroke: {
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  fill: {
    opacity: 1,
  },  
  markers: {
    size: 0
  },
  colors: ['#87CEFA'],
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MM',
        day: 'dd',
        hour: 'HH:mm:ss'
      }
    }
  },
  yaxis: {
    tickAmount: 3,
    labels: {
      formatter: function(val, index) {
        return val.toFixed(2);
      }
    }
  },
  tooltip: {
    x: {
      format: 'HH:mm:ss'
    }
  }
};
// ▼zoom chart draw 
var zoom_chart = new ApexCharts(document.querySelector("#zoom-chart"), zoom_options);
zoom_chart.render();


// ▼main chart option
var main_options = {
  series: [{
    data: [0]
  }],
  chart: {
    id: 'main_chart',
    type: 'line',
    height: 180,
    brush: {
      target: 'zoom_chart',
      enabled: true
    },
    selection: {
      enabled: true
    },
  },
  annotations: {
    yaxis: [
      {
        y: _alert.pwbgt.warning,
        y2: _alert.pwbgt.danger,
        borderColor: '#ffff00',
        fillColor: '#ffff00',
        label: {
          //text: '警告エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#f6c23e',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      },
      { 
        y: _alert.pwbgt.danger,
        y2: 40,
        borderColor: '#ff0000',
        fillColor: '#ff0000',
        label: {
          //text: '危険エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#e74a3b',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      }
    ]
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#87CEFA'],
  xaxis: {
    type: 'datetime',
    //categories: category_data,
    labels: {
      datetimeUTC: false,
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MM',
        day: 'dd',
        hour: 'HH:mm:ss'
      }
    }
  },
  yaxis: {
    tickAmount: 3,
    labels: {
      formatter: function(val, index) {
        return val.toFixed(2);
      }
    }
  }
};

// ▼main char draw
var main_chart = new ApexCharts( document.querySelector( "#main-chart" ), main_options );  
main_chart.render();


/**
 * 直近グラフ 最初に選択するいちの
 * スタートする時間を返す
 */
function getStartPoint( ary, num ) {
  
  // データの数が引数より多ければ
  if( num < ary.length ) {
    return ary.length - num;
  }

  // データの数が引数より小さければ
  else {
    return 0;
  }
}


/* メイン処理関係 */

/**
 * メイン処理
 */
$(function() {

  // ログイン情報取得
  getLoginInfo();

  // 直近グラフのコンボボックス用マネージャ
  nearestCombManager();

  // ApexCharts グラフデータ作成（今日の日付で）
  //makeCategoryDate( dateFormat( new Date(), 'yyyy/MM/dd' ) );

  // 初回表示
  post_send();

  // 繰り返し処理
  setInterval("post_send()", 60000);
})


/**
 * ログイン情報の取得
 */
 function getLoginInfo() {

  // url の引数を受け取る
  var data = location.href.split("?")[1]
  var parameter = data.split("&")

  // 引数受け取り用
  var parameters = []
  for( i in parameter ) {
    parameters.push (parameter[i].split("=")[1])
  }
  login_person = parameters[0]
}


/**
 * 直近グラフのコンボボックスに値をセット & 値を監視するマネージャー
 */
function nearestCombManager()
{
  // コンボボックスのインスタンス
  var select = document.getElementById( 'nearest-graph-select' )

  // 表示する項目をセット
  nearest_select_graphs.forEach( item => {
    select.add( new Option( item.name, item.type ) )  // Option( 表示項目, value )
  } )

  // コンボボックスの変更を監視
  select.onchange = function()
  {

    // 選択されているoption要素を取得する
    var selectedItem = this.options[ this.selectedIndex ]

    // 変更されたバリューを記憶しておく
    nearest_comb_selected = selectedItem.value

    // グラフを更新する
    updateNearestGraph()
  }
}


/**
 * post で Lambda とデータのやり取りを行う
 */
function post_send() {

  // 送信する json ファイルの作成
  var jsonData = {
    "value1": login_person // urlの引数を取得
    // "value1": $('#nodeno').val() // テスト用
  };	

  //alert(JSON.stringify(jsonData));

  // 送信処理
  $.ajax({
    type: 'post',
    url: url,
    data: JSON.stringify( jsonData ),
    contentType: 'application/json',
    dataType: 'json',
    scriptCharset: 'utf-8',
    success: function( data ) {

      // ▼test MessageBox
      // Success
      //alert("success");
      //alert(JSON.stringify(data));

      // 再描画用にデータを更新
      postDataSet( data[ "body" ] )

      // 直近グラフのアップデート
      updateNearestGraph()
    },
    error: function( data ) {
      // Error
      alert( "error" );
      alert( JSON.stringify( data ) )
    }
  });
}


/**
 * post の response データを全てのデータに適用する
 * response・・・post送信処理で帰ってきたデータ
 */
function postDataSet( response ){

  // データ格納用配列の作成
  var time = [];    // 時間
  var hr = [];      // 心拍数
  var pwbgt = [];   // pwbgt
  var ee = [];      // 活動量
  var iee = [];     // 累計活動量

  // ApexCharts用データ配列
  var _pwbgt_series = [];
  var _hr_series = [];
  var _ee_series = [];
  var _iee_series = [];

  // 累計活動量
  var iee_num = 0;

  // レスポンスデータの数だけ繰り返す
  response.forEach(item => {

    // 累計活動量の計算
    iee_num += item["ee"];

    // 各配列にデータを格納する
    time.push( item[ "jikan" ] );                 // 時間
    hr.push( parseFloat(item[ "hr" ]) );          // 心拍数
    pwbgt.push( parseFloat( item[ "pwbgt" ] ) );  // pwbgt
    ee.push( item[ "ee" ] );                      // 活動量
    iee.push( iee_num );                          // 累計活動量
    
    // ApexCharts 直近グラフ用
    _pwbgt_series.push( [ item[ "nichiji" ], item[ "pwbgt" ] ] );
    _hr_series.push( [ item[ "nichiji" ], item[ "hr" ] ] );
    _ee_series.push( [ item[ "nichiji" ], item[ "ee" ] ] );
    _iee_series.push( [ item[ "nichiji" ], iee_num ] );
  });

  // ◇値をセットする
  // ▼x軸
  date = time;
  // データセット
  // ▼pwbgt
  pwbgt_data = pwbgt;    // バイタルデータ（pwbgt）
  // ▼心拍数
  hr_data = hr;          // バイタルデータ（心拍数）
  // ▼活動量グラフ
  ee_data = ee;          // バイタルデータ（活動量）
  iee_data = iee;        // バイタルデータ（累計活動量）

  // ◇ApexChats series用のデータを更新する
  // ▼直近データ 
  nearest_series.pwbgt = _pwbgt_series;   // pwbgt
  nearest_series.hr = _hr_series;         // hr
  nearest_series.ee = _ee_series;         // ee
  nearest_series.iee = _iee_series;       // iee

  // ◇パーセンテージを計算する
  // パーセンテージ計算用オブジェクト
  var values = {
    hr: hr[ hr.length -1 ],
    pwbgt: pwbgt[ pwbgt.length -1 ],
    ee: ee[ ee.length - 1 ]
  };
  // パーセンテージ計算
  calc_percent( values );
}


/**
 * パーセンテージの計算
 */
 function calc_percent( calc_obj ) {
  // パーセント計算の母数
  var _hr_percent = 35;
  var _pwbgt_percent = 3;
  var _ee_percent = 4000;

  // パーセント計算を適応させる開始の値
  var hr_offset = 65;
  var pwbgt_offset = 35;
  var ee_offset = 0;

  // パーセンテージを計算する
  var hr_percent    = Math.floor( ( ( calc_obj.hr - hr_offset ) / _hr_percent ) * 100 );
  var pwbgt_percent = Math.floor( ( ( calc_obj.pwbgt - pwbgt_offset ) / _pwbgt_percent ) * 100 );
  var ee_percent    = Math.floor( ( ( calc_obj.ee - ee_offset ) / _ee_percent ) * 100 );

  // 数値外の値を 0 <= x <= 100 の値の中に丸め込む
  // ▼ 心拍数
  if( hr_percent < 0 ){
    hr_percent = 0;
  }
  else if( 100 < hr_percent ){
    hr_percent = 100;
  }

  // ▼ pwbgt
  if( pwbgt_percent < 0 ){
    pwbgt_percent = 0;
  }
  else if( 100 < pwbgt_percent ){
    pwbgt_percent = 100;
  }

    // ▼ 活動量
  if( ee_percent < 0 ){
    ee_percent = 0;
  }
  else if( 100 < ee_percent ){
    ee_percent = 100;
  }

  // グローバル変数に格納する
  _percent.hr = hr_percent;
  _percent.pwbgt = pwbgt_percent;
  _percent.ee = ee_percent;
}


/**
 * ApexChartsの x軸用のデータを作成してグラフに適用させる関数
 */
function makeCategoryDate( day_str ) {

  // 引数の日付で24時間分表示できる category データ配列を作成
  
  // base となる Date型を作成
  var base_date_time = new Date( day_str + ' 00:00:00' );

  // 格納用配列
  var date_times = [];

  // 0時 ～ 24時までの Date型配列を作成
  for( var i = 0; i < 25; i++ ){
    
    // 配列に格納
    date_times.push( new Date( dateFormat( base_date_time, 'yyyy/MM/dd HH:mm:ss' ) ) );

    // 一時間進める
    base_date_time.setHours( base_date_time.getHours() + 1 );
  }

  // グラフに適用させる
  category_data = date_times;
}


/**
 * 日付のフォーマットを整える
 */
 function dateFormat ( date, format ) {
 
  format = format.replace ( /yyyy/, zeroPadding ( date.getFullYear(), 4 ) );
  format = format.replace ( /MM/, zeroPadding ( date.getMonth() + 1, 2 ) );
  format = format.replace ( /dd/, zeroPadding ( date.getDate(), 2 ) );
  format = format.replace ( /HH/, zeroPadding ( date.getHours(),2 ) );
  format = format.replace ( /mm/, zeroPadding ( date.getMinutes(), 2 ) );
  format = format.replace ( /ss/, zeroPadding ( date.getSeconds(), 2 ) );

  return format;
}


/**
 * ゼロ埋め行う関数
 */
function zeroPadding( NUM, LEN ) {
  // NUM=値 LEN=桁数
	return ( Array( LEN ).join( '0' ) + NUM ).slice( -LEN );
}



/**
 * 直近グラフのアップデート
 */
function updateNearestGraph() {
  
  // 変更項目
  var series = [];  // データ
  var name = '';    // データの名前
  var warning = 0;
  var danger = 0;

  // 選択されている項目別に表示する値を変更する
  switch( nearest_comb_selected ) {
    // pwbgt
    case 'pwbgt':
      name = 'PWBGT';
      series = nearest_series.pwbgt;
      warning = _alert.pwbgt.warning;
      danger = _alert.pwbgt.danger;

      break;

    // hr
    case 'hr':
      name = '心拍数';
      series = nearest_series.hr;
      warning = _alert.hr.warning;
      danger = _alert.hr.danger;

      break;

    // ee
    case 'ee':
      name = '活動量';
      series = nearest_series.ee;
      warning = _alert.ee.warning;
      danger = _alert.ee.danger;

      break;

    // iee
    case 'iee':
      name = '累計活動量';
      series = nearest_series.iee;
      warning = 0;
      danger = 0;

      break;
  }

  // ▼zoom chart update
  zoom_chart.updateOptions({ 
    series: [{
      name: name,
      data: series
    }],
    annotations: {
      yaxis: [{
        y: warning,
        y2: danger,
        borderColor: '#ffa500',
        fillColor: '#FEB019',
        label: {
          //text: '警告エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#f6c23e',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      },
      {
        y: danger,
        y2: danger * 2,
        borderColor: '#ff0000',
        fillColor: '#ffc0cb',
        label: {
          //text: '危険エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#e74a3b',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      }]
    }
  });

  // ▼main chart update
  main_chart.updateOptions ({ 
    series: [{
      data: series
    }],
    chart: {
      selection: {
        enabled: true,
        xaxis: {
          min: new Date ( series [ getStartPoint(series, 30) ][0] ).getTime(),
          max: new Date ( series [ series.length - 1 ][0] ).getTime()
        }
      }
    },
    annotations: {
      yaxis: [{
        y: warning,
        y2: danger,
        borderColor: '#ffa500',
        fillColor: '#FEB019',
        label: {
          //text: '警告エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#f6c23e',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      },
      {
        y: danger,
        y2: danger * 2,
        borderColor: '#ff0000',
        fillColor: '#ffc0cb',
        label: {
          //text: '危険エリア',
          offsetY: 20,
          textAnchor: 'start',
          position: 'left',
          style: {
            color: '#e74a3b',
            fontSize: '14px',
            fontWeight: 800,
            background: '#fff',
          }
        }
      }]
    }
  });
}