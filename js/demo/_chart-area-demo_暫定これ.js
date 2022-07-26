// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';


/**
 * 多分フォーマットの変更...無いと動かない
 * サンプルの時からあるやつ
 */
function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}


// ◇メイン処理 < indexページ >
// ▼基本データ
// Lambda の url
// var url = "https://9z7ckeasz0.execute-api.ap-northeast-1.amazonaws.com/post-graph-data";　// <- 本番 DB アクセス
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

// ◇警告・危険値（各データの）
var _alert = {
  pwbgt: {
    danger: 37.4,
    warning: 36.5,
  },
  hr: {
    danger: 93,
    warning: 82.5, 
  },
  ee: {
    danger: 3200,
    warning: 2000
  }
}; 

// ◇メイングラフ関係
// ・chats（グラフ描画用インスタンス）
// ▼pwbgtグラフ
var ctx_pwbgt = document.getElementById('myAreaChart_pwbgt');
var chart_pwbgt = $('#myAreaChart_pwbgt').data('chart');
// ▼hrグラフ 2
var ctx_hr = document.getElementById('myAreaChart_hr');
var chart_hr = $('#myAreaChart_hr').data('chart');
// ▼eeグラフ 2
var ctx_ee = document.getElementById('myAreaChart_ee');
var chart_ee = $('#myAreaChart_ee').data('chart');

// ▼グラフ view 関係
var hr = { "str": "心拍数", "color": "rgba(78, 115, 223)" };
var pwbgt = { "str": "pwbgt", "color": "rgba(28, 200, 138)" };
var ee = { "str": "活動量", "color": "rgba(54, 185, 204)" };
var iee = { "str": "累計活動量", "color": "rgba(246, 194, 62)" };
var time = "時間";

// ↓メイングラフの初期値（適当な値だが無いとグラフ表示できない）
// ▼labels <- x軸用のデータ
var _labels = ["初期","1期","2期","3期","4期","5期","終期"];

// ◇データセット
// ▼グラフ-pwbgt- 
var datasets_pwbgt = [{
    label: pwbgt["str"],
    lineTension: 0.4,
    backgroundColor: "rgba(28, 200, 138, 0.05)",
    borderColor: "rgba(28, 200, 138, 1)",
    pointRadius: 0,
    pointBackgroundColor: "rgba(28, 200, 138, 1)",
    pointBorderColor: "white",
    pointHoverRadius: 3,
    pointHoverBackgroundColor: "rgba(28, 200, 138, 1)",
    pointHoverBorderColor: "rgba(28, 200, 138, 1)",
    pointHitRadius: 10,
    pointBorderWidth: 2,
    data: [30, 60, 30, 80, 95, 20, 50],
  },
  {
    label: '警告ライン',
    data: [],
    borderColor: 'rgba(246, 194, 62, 1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  },
  {
    label: '危険ライン',
    data: [],
    borderColor: 'rgba(231, 74, 59, 1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  }];

// ▼グラフ-心拍数-
var datasets_hr = [{
    label: hr["str"],
    lineTension: 0.4,
    backgroundColor: "rgba(78, 115, 223, 0.05)",
    borderColor: "rgba(78, 115, 223, 1)",
    pointRadius: 0,
    pointBackgroundColor: "rgba(78, 115, 223, 1)",
    pointBorderColor: "white",
    pointHoverRadius: 3,
    pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
    pointHoverBorderColor: "rgba(78, 115, 223, 1)",
    pointHitRadius: 10,
    pointBorderWidth: 2,
    data: [100, 97, 87, 50, 21, 13, 10],
  },
  {
    label: '警告ライン',
    data: [],
    borderColor: 'rgba(246, 194, 62, 1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  },
  {
    label: '危険ライン',
    data: [],
    borderColor: 'rgba(231, 74, 59, 1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  }];

// ▼グラフ-活動量＆累計活動量-
var datasets_ee = [
  {
    label: ee["str"],
    lineTension: 0.4,
    backgroundColor: "rgba(54, 185, 204, 0.05)",
    borderColor: "rgba(54, 185, 204, 1)",
    pointRadius: 0,
    pointBackgroundColor: "rgba(54, 185, 204, 1)",
    pointBorderColor: "white",
    pointHoverRadius: 3,
    pointHoverBackgroundColor: "rgba(54, 185, 204, 1)",
    pointHoverBorderColor: "rgba(54, 185, 204, 1)",
    pointHitRadius: 10,
    pointBorderWidth: 2,
    data: [100, 97, 87, 50, 21, 13, 10],
    yAxisID: "y-axis-l" // Y軸用ID
  },
  {
    label: iee["str"],
    lineTension: 0.4,
    backgroundColor: "rgba(246, 194, 62, 0.05)",
    borderColor: "rgba(246, 194, 62, 1)",
    pointRadius: 0,
    pointBackgroundColor: "rgba(246, 194, 62, 1)",
    pointBorderColor: "white",
    pointHoverRadius: 3,
    pointHoverBackgroundColor: "rgba(246, 194, 62, 1)",
    pointHoverBorderColor: "rgba(246, 194, 62, 1)",
    pointHitRadius: 10,
    pointBorderWidth: 2,
    data: [30, 60, 30, 80, 95, 20, 50],
    yAxisID: "y-axis-r" // Y軸用ID
  },
  {
    label: '警告ライン',
    data: [],
    borderColor: 'rgba(246, 194, 62, 1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  },
  {
    label: '危険ライン',
    data: [],
    borderColor: 'rgba(231, 74, 59, 1)',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  }];


/*
 * サブグラフ用（直近）
 */
// ▼取得するデータの数
var _length = 5;

// ▼Vue データ（サブグラフ表示制御用）
var _subGraph = new Vue( {
  el: '#app',
  data: {
    // グラフ表示するデータ
    datasets: [],
    // グラフ表示する 警告値＆危険値
    levels: {
      warning: [],
      danger: []
    },
    // グラフ表示するデータの種類
    graphs: [{
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
      },
    ],
    // コンボボックスでセレクトされている値
    graphSelected: 'pwbgt',
    // 心拍数を表示する為のデータ
    hr_data: {
      main: [],
      warning: [],
      danger: []
    },
    // pwbgt を表示するためのデータ
    pwbgt_data: {
      main: [],
      warning: [],
      danger: []
    },
    // 活動量を表示するためのデータ
    ee_data: {
      main: [],
      warning: [],
      danger: []
    },
    // 累計活動量のデータ
    iee_data: [],
    // 時間のデータ
    labels: []
  },
  // データの変更を監視する
  watch: {
    // datasets が変更された場合
    datasets: {
      handler() {
        this.canvas.data.datasets[0].data = this.datasets;
        this.canvas.data.labels = this.labels;
        this.canvas.update();
      }
    },
    // コンボボックスに変更があった場合
    graphSelected: {
      handler() {
        this.canvas.destroy();
        this.changeDataSet();
        this.chart();
      }
    },
    // 時間が更新された場合
    labels: {
      handler() {
        this.canvas.destroy();
        this.changeDataSet();
        this.chart();
      }
    }
  },
  mounted() { // ←Vue のライフサイクル (多分 html が構成され終わったタイミング)
    this.chart();
    this.setAlertData();
  },
  // Vue関数
  methods: {
    // ▼これは使わない
    toRaw(data) {
      return JSON.stringify(data);
    },
    // ▼グラフの描画
    chart() {
      var vm = this;
      var ctx = document.getElementById("charts");
      vm.canvas = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [{
            label: 'データ推移',
            backgroundColor: 'rgba(135, 206, 250, 0.5)',
            data: vm.datasets
          },
          {
            label: '警告ライン',
            data: this.levels.warning,
            borderColor: 'rgba(246, 194, 62, 1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
          },
          {
            label: '危険ライン',
            data: this.levels.danger,
            borderColor: 'rgba(231, 74, 59, 1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
          }]
        },
      });
    },
    // ▼グラフ表示に使用するデータを変更する
    changeDataSet() {
      switch ( this.graphSelected ) {
        case 'hr': 
          this.datasets = this.hr_data.main;
          this.levels.warning = this.hr_data.warning;
          this.levels.danger = this.hr_data.danger;
          break;
        case 'pwbgt':
          this.datasets = this.pwbgt_data.main;
          this.levels.warning = this.pwbgt_data.warning;
          this.levels.danger = this.pwbgt_data.danger;
          break;
        case 'ee':
          this.datasets = this.ee_data.main;
          this.levels.warning = this.ee_data.warning;
          this.levels.danger = this.ee_data.danger;
          break;
        case 'iee':
          this.datasets = this.iee_data;
          this.levels.warning = [];
          this.levels.danger = [];
          break;
      }
    },
    // ▼警告・危険値のセット
    setAlertData () {   
      for ( var i = 0; i < _length; i++ ) {
        // 心拍数
        this.hr_data.warning[i] = _alert.hr.warning;
        this.hr_data.danger[i] = _alert.hr.danger;
        // pwbgt
        this.pwbgt_data.warning[i] = _alert.pwbgt.warning;
        this.pwbgt_data.danger[i] = _alert.pwbgt.danger;
        // 活動量
        this.ee_data.warning[i] = _alert.ee.warning;
        this.ee_data.danger[i] = _alert.ee.danger;
      }  
    }
  }
});


/**
 * メイン関数
 */
$(function() {

  // ログイン情報の取得
  // url の引数を受け取る
  var data = location.href.split("?")[1];
  var parameter = data.split("&");
  // 引数受け取り用
  var parameters = [];
  for( i in parameter ) {
    parameters.push (parameter[i].split("=")[1]);
  }
  login_person = parameters[0];

  // ログイン者表示
  var login_name = document.getElementById('login_name');
  login_name.textContent = `ノード番号：${login_person}`;
  //login_name.textContent = `<span class="mr-2 d-none d-lg-inline text-gray-600 small">${login_person}</span>`;

  // ローディング画面表示処理
  disp_loading();

  // 初回表示
  post_send();

  // 繰り返し処理
  setInterval("post_send()", 60000);

  // ボタンを押したときの処理
  $('#button').click( function() {
    // post送信処理
    post_send();
  });

});


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
    data: JSON.stringify(jsonData),
    contentType: 'application/json',
    dataType: 'json',
    scriptCharset: 'utf-8',
    success: function(data) {

      // Success
      //alert("success");
      //alert(JSON.stringify(data));

      // 再描画用にデータを更新
      postDataSet(data["body"]);

      // グラフ再描画
      draw_graph();
      
      // 各カードの値を変更する
      changeCardData();

      // プログレスバーの表示
      update_progress();

      //ローディング画面を隠す
      hide_loading();
    },
    error: function(data) {

      // Error
      alert("error");
      alert(JSON.stringify(data))
    }
  });
}


/**
 * post の response データを全てのデータに適用する
 * response・・・post送信処理で帰ってきたデータ
 */
function postDataSet(response) {

  // データ格納用配列の作成
  var time = [];    // 時間
  var hr = [];      // 心拍数
  var pwbgt = [];   // pwbgt
  var ee = [];      // 活動量
  var iee = [];     // 累計活動量

  // 累計活動量
  var iee_num = 0;

  // レスポンスデータの数だけ繰り返す
  response.forEach(item => {
    
    // 累計活動量の計算
    iee_num += item["ee"];

    // 各配列にデータを格納する
    time.push(item["jikan"]);
    hr.push(parseFloat(item["hr"]));
    pwbgt.push(parseFloat(item["pwbgt"]));
    ee.push(item["ee"]);
    iee.push(iee_num);
  });


  // ◇各データの危険値と警告値の決定
  // ▼pwbgt
  var pwbgt_warning = [];
  var pwbgt_danger = [];
  for( var i = 0; i < pwbgt.length; i++ )
  {
    pwbgt_danger.push ( _alert.pwbgt.danger );
    pwbgt_warning.push ( _alert.pwbgt.warning );
  }
  // ▼心拍数
  var hr_warning = [];
  var hr_danger = [];
  for( var i = 0; i < hr.length; i++ )
  {
    hr_danger.push ( _alert.hr.danger );
    hr_warning.push ( _alert.hr.warning );
  }
  // ▼活動量
  var ee_warning = [];
  var ee_danger = [];
  for( var i = 0; i < ee.length; i++ )
  {
    ee_danger.push ( _alert.ee.danger );
    ee_warning.push ( _alert.ee.warning );
  }


  // ◇値をセットする
  // ▼x軸
  _labels = time;
  // データセット
  // ▼pwbgt
  datasets_pwbgt[0].data = pwbgt;         // バイタルデータ
  datasets_pwbgt[1].data = pwbgt_warning; // 警告値
  datasets_pwbgt[2].data = pwbgt_danger;  // 危険値
  // ▼心拍数
  datasets_hr[0].data = hr;          // バイタルデータ
  datasets_hr[1].data = hr_warning;  // 警告値 
  datasets_hr[2].data = hr_danger;   // 危険値
  // ▼グラフ 2
  datasets_ee[0].data = ee;         // バイタルデータ（活動量）
  datasets_ee[1].data = iee;        // バイタルデータ（累計活動量）
  datasets_ee[2].data = ee_warning; // 警告値
  datasets_ee[3].data = ee_danger;  // 危険値


  // ◇パーセンテージを計算する
  // パーセンテージ計算用オブジェクト
  var values = {
    hr: hr [ hr.length -1 ],
    pwbgt: pwbgt [ pwbgt.length -1 ],
    ee: ee [ ee.length - 1 ]
  };
  // パーセンテージ計算
  calc_percent ( values );


  // ◇サブグラフ用のデータ取
  // ▼格納用配列を取得する
  var hr_ary = new Array(_length);        // 心拍数  
  var pwbgt_ary = new Array(_length);     // pwbgt
  var ee_ary = new Array(_length);        // 活動量 
  var iee_ary = new Array(_length);       // 累計活動量
  var time_ary = new Array(_length)       // 時間

  // ▼最新の履歴を取得する
  offset = _length;
  for ( var i = 0; i < _length; i++ ) {
    hr_ary[i] = hr [ hr.length - offset ];           // 心拍数
    pwbgt_ary[i] = pwbgt [ pwbgt.length - offset ];  // pwbgt
    ee_ary[i] = ee [ ee.length - offset ];           // 活動量
    iee_ary[i] = iee [ iee.length - offset ];        // 累計活動量
    time_ary[i] = time[ time.length - offset ];      // 時間
    // オフセット位置をずらす
    offset--;
  }

  // ▼サブグラフ用の値更新を Vue に通知
  _subGraph.$data.hr_data.main = hr_ary;          // 心拍数
  _subGraph.$data.pwbgt_data.main = pwbgt_ary;    // pwbgt
  _subGraph.$data.ee_data.main = ee_ary;          // 活動量
  _subGraph.$data.iee_data = iee_ary;             // 累計活動量
  _subGraph.$data.labels = time_ary;              // 時間
}


/**
 * 各カードのデータを更新する
 */
function changeCardData() {

  // 各データ配列を取得
  var hr_dataset_now = datasets_hr[0].data;      // 心拍数
  var pwbgt_dataset_now = datasets_pwbgt[0].data;   // pwbgt
  var ee_dataset_now = datasets_ee[0].data;      // 活動量
  var iee_dataset_now = datasets_ee[1].data;     // 累計活動量

  // 最新のデータを抽出する
  var hr_num = hr_dataset_now[hr_dataset_now.length - 1];             // 心拍数
  var pwbgt_num = pwbgt_dataset_now[pwbgt_dataset_now.length - 1];    // pwbgt
  var ee_num = ee_dataset_now[ee_dataset_now.length - 1];             // 活動量
  var iee_num = iee_dataset_now[iee_dataset_now.length - 1];          // 累計活動量

  // カードに表示する
  $('#hr-str').text(String(Math.round(hr_num)));
  $('#pwbgt-str').text(String(Math.round(pwbgt_num)));
  $('#ee-str').text(String(ee_num));
  $('#iee-str').text(String(iee_num));

  // ステータスによって文字の色を変更
  // ▼ 心拍数
  if ( _danger <= _percent.hr ) {
    // 危険
    $('#hr-str').css ( 'color', '#e74a3b' );
  }
  else if ( _warning <= _percent.hr ) {
    // 警告
    $('#hr-str').css ( 'color', '#f6c23e' );
  }
  else {
    // 通常
    $('#hr-str').css ( 'color', '#5a5c69' );
  }

  // ▼ pwbgt
  if ( _danger <= _percent.pwbgt ) {
    // 危険
    $('#pwbgt-str').css ( 'color', '#e74a3b' );
  }
  else if ( _warning <= _percent.pwbgt ) {
    // 警告
    $('#pwbgt-str').css ( 'color', '#f6c23e' );
  }
  else {
    // 通常
    $('#pwbgt-str').css ( 'color', '#5a5c69' );
  }

  // ▼ 活動量
  if ( _danger <= _percent.ee ) {
    // 危険
    $('#ee-str').css ( 'color', '#e74a3b' );
  }
  else if ( _warning <= _percent.ee ) {
    // 警告
    $('#ee-str').css ( 'color', '#f6c23e' );
  }
  else {
    // 通常
    $('#ee-str').css ( 'color', '#5a5c69' );
  }
}


/**
 * ステータス欄の更新
 */
function update_progress() {

  // パーセンテージの状態を html に反映する
  // ▼ 心拍数
  if ( _danger <= _percent.hr ) {
    // 危険表示
    $('#hr-progress').css ( 'width', _percent.hr + '%' )
                     .css ( 'background-color', '#e74a3b' )
                     .prop ( 'aria-valuenow', _percent.hr );
    $('#hr-icon').html (`<i class="fas fa-dizzy fa-lg text-danger ml-2 faa-tada animated"></i>`);
    $('#hr-text').html (`<span class="text-danger ml-2">危険</span>`);
  }
  else if ( _warning <= _percent.hr ) {
    // 警告表示
    $('#hr-progress').css ( 'width', _percent.hr + '%' )
                     .css ( 'background-color', '#f6c23e' )
                     .prop ( 'aria-valuenow', _percent.hr );
    $('#hr-icon').html (`<i class="fas fa-tired fa-lg text-warning ml-2 faa-ring animated"></i>`);
    $('#hr-text').html (`<span class="text-warning ml-2">警告</span>`);
  }
  else {
    // 通常表示
    $('#hr-progress').css ( 'width', _percent.hr + '%' )
                     .css ( 'background-color', '#4e73df' )
                     .prop ( 'aria-valuenow', _percent.hr );
    $('#hr-icon').html (`<i class="fas fa-smile fa-lg text-primary ml-2 faa-pulse animated"></i>`);
    $('#hr-text').html (`<span class="text-primary ml-2">平常</span>`);
  }

  // ▼ pwbgt
  if ( _danger <= _percent.pwbgt ) {
    // 危険表示
    $('#pwbgt-progress').css ( 'width', _percent.pwbgt + '%' )
                     .css ( 'background-color', '#e74a3b' )
                     .prop ( 'aria-valuenow', _percent.pwbgt );
    $('#pwbgt-icon').html (`<i class="fas fa-dizzy fa-lg text-danger ml-2 faa-tada animated"></i>`);
    $('#pwbgt-text').html (`<span class="text-danger ml-2">危険</span>`);
  }
  else if ( _warning <= _percent.pwbgt ) {
    // 警告表示
    $('#pwbgt-progress').css ( 'width', _percent.pwbgt + '%' )
                     .css ( 'background-color', '#f6c23e' )
                     .prop ( 'aria-valuenow', _percent.pwbgt );
    $('#pwbgt-icon').html (`<i class="fas fa-tired fa-lg text-warning ml-2 faa-ring animated"></i>`);
    $('#pwbgt-text').html (`<span class="text-warning ml-2">警告</span>`);
  }
  else {
    // 通常表示
    $('#pwbgt-progress').css ( 'width', _percent.pwbgt + '%' )
                     .css ( 'background-color', '#4e73df' )
                     .prop ( 'aria-valuenow', _percent.pwbgt );
    $('#pwbgt-icon').html (`<i class="fas fa-smile fa-lg text-primary ml-2 faa-pulse animated"></i>`);
    $('#pwbgt-text').html (`<span class="text-primary ml-2">平常</span>`);
  }

  // ▼ 活動量
  if ( _danger <= _percent.ee ) {
    // 危険表示
    $('#ee-progress').css ( 'width', _percent.ee + '%' )
                     .css ( 'background-color', '#e74a3b' )
                     .prop ( 'aria-valuenow', _percent.ee );
    $('#ee-icon').html (`<i class="fas fa-dizzy fa-lg text-danger ml-2 faa-tada animated"></i>`);
    $('#ee-text').html (`<span class="text-danger ml-2">危険</span>`);
  }
  else if ( _warning <= _percent.ee ) {
    // 警告表示
    $('#ee-progress').css ( 'width', _percent.ee + '%' )
                     .css ( 'background-color', '#f6c23e' )
                     .prop ( 'aria-valuenow', _percent.ee );
    $('#ee-icon').html (`<i class="fas fa-tired fa-lg text-warning ml-2 faa-ring animated"></i>`);
    $('#ee-text').html (`<span class="text-warning ml-2">警告</span>`);
  }
  else {
    // 通常表示
    $('#ee-progress').css ( 'width', _percent.ee + '%' )
                     .css ( 'background-color', '#4e73df' )
                     .prop ( 'aria-valuenow', _percent.ee );
    $('#ee-icon').html (`<i class="fas fa-smile fa-lg text-primary ml-2 faa-pulse animated"></i>`);
    $('#ee-text').html (`<span class="text-primary ml-2">平常</span>`);
  }
}


/**
 * パーセンテージの計算
 */
function calc_percent ( calc_obj ) {
  // パーセント計算の母数
  var _hr_percent = 35;
  var _pwbgt_percent = 3;
  var _ee_percent = 4000;

  // パーセント計算を適応させる開始の値
  var hr_offset = 65;
  var pwbgt_offset = 35;
  var ee_offset = 0;

  // パーセンテージを計算する
  var hr_percent    = Math.floor ( ( ( calc_obj.hr - hr_offset ) / _hr_percent ) * 100 );
  var pwbgt_percent = Math.floor ( ( ( calc_obj.pwbgt - pwbgt_offset ) / _pwbgt_percent ) * 100 );
  var ee_percent    = Math.floor ( ( ( calc_obj.ee - ee_offset ) / _ee_percent ) * 100 );

  // 数値外の値を 0 <= x <= 100 の値の中に丸め込む
  // ▼ 心拍数
  if ( hr_percent < 0 ) {
    hr_percent = 0;
  }
  else if ( 100 < hr_percent ) {
    hr_percent = 100;
  }

  // ▼ pwbgt
  if ( pwbgt_percent < 0 ) {
    pwbgt_percent = 0;
  }
  else if ( 100 < pwbgt_percent ) {
    pwbgt_percent = 100;
  }

    // ▼ 活動量
  if ( ee_percent < 0 ) {
    ee_percent = 0;
  }
  else if ( 100 < ee_percent ) {
    ee_percent = 100;
  }

  // グローバル変数に格納する
  _percent.hr = hr_percent;
  _percent.pwbgt = pwbgt_percent;
  _percent.ee = ee_percent;
}


/**
 * グラフの描画
 */
function draw_graph() {
  
  // ▼chart の初期化
  reset_chats(); // <- これをしないとグラフ再描画時に表示がバグる

  // ◇グラフ表示-pwbgt-
  chart_pwbgt = new Chart(ctx_pwbgt, {
    type: 'line',
    data: {
      labels: _labels,
      datasets: datasets_pwbgt,
    },
    options: {
      maintainAspectRatio: false,
      //responsive: false,
      layout: {
        padding: {  
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          scaleLabel: {             // 軸ラベル
            display: true,          // 表示設定
            labelString: time       // ラベル
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 10
          }
        }],
        yAxes: [{
          ticks: {
            padding: 10,
            fontColor: pwbgt["color"],
            min: 34, 
            max: 38.5
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          },
          scaleLabel: {
            display: true,
            labelString: pwbgt["str"],
            fontColor: pwbgt["color"]
          }
        }]
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: true,
        intersect: true,
        mode: 'index',
        caretPadding: 10
      }
    }
  });

  // グラフ表示-hr-
  chart_hr = new Chart(ctx_hr, {
    type: 'line',
    data: {
      labels: _labels,
      datasets: datasets_hr,
    },
    options: {
      maintainAspectRatio: false,
      //responsive: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          scaleLabel: {                 // 軸ラベル
            display: true,            // 表示設定
            labelString: time       // ラベル
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 10
          }
        }],
        yAxes: [{
          ticks: {
            padding: 10,
            fontColor: hr["color"],
            max: 110,
            min: 60
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          },
          scaleLabel: {
            display: true,
            labelString: hr["str"],
            fontColor: hr["color"]
          }
        }]
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: true,
        intersect: true,
        mode: 'index',
        caretPadding: 10
      }
    }
  });

  // グラフ表示 -活動量＆累計活動量-
  chart_ee = new Chart(ctx_ee, {
    type: 'line',
    data: {
      labels: _labels,
      datasets: datasets_ee,
    },
    options: {
      maintainAspectRatio: false,
      //responsive: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          scaleLabel: {                 // 軸ラベル
            display: true,            // 表示設定
            labelString: time       // ラベル
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 10
          }
        }],
        yAxes: [{
          id: "y-axis-l",   // Y軸のID
          position: "left", // どちら側に表示される軸か？
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            fontColor: ee["color"],
            // Include a dollar sign in the ticks
            callback: function(value, index, values) {
              return number_format(value);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          },
          scaleLabel: {
            display: true,
            labelString: ee["str"],
            fontColor: ee["color"]
          }
        },
        {
          id: "y-axis-r",   // Y軸のID
          position: "right", // どちら側に表示される軸か？
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            fontColor: iee["color"],
            // Include a dollar sign in the ticks
            callback: function(value, index, values) {
              return number_format(value);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          },
          scaleLabel: {
            display: true,
            labelString: iee["str"],
            fontColor: iee["color"]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: true,
        intersect: true,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + '：' +number_format(tooltipItem.yLabel);
          }
        }
      }
    }
  });
}


/**
 * chats のリセット
 */
function reset_chats() 
{
  // chats_pwbgt のリセット
  if ( chart_pwbgt ) {
    chart_pwbgt.update();
  }

   // chats_hr のリセット
  if ( chart_hr ) {
   chart_hr.destroy();
  }

  // chats_ee のリセット
  if ( chart_ee ) {
   chart_ee.destroy();
  }
}


 /**
 * ローディング画面の表示
 */
function disp_loading()
{
  // グラフ表示部分を隠す
  $('#myAreaChart_pwbgt').css('display','none');
  $('#myAreaChart_hr').css('display','none');
  $('#myAreaChart_ee').css('display','none');
  // ローディングを表示
  $('#loading_pwbgt').css('display', 'block');
  $('#loading_hr').css('display', 'block');
  $('#loading_ee').css('display', 'block');
}


 /**
 * ローディング画面の非表示
 */
function hide_loading()
{
  // ローディングを隠す
  $('#loading_pwbgt').css('display','none');
  $('#loading_hr').css('display','none');
  $('#loading_ee').css('display','none');
  // グラフ部分を表示
  $('#myAreaChart_pwbgt').delay(900).css('display', 'block');
  $('#myAreaChart_hr').delay(900).css('display', 'block');
  $('#myAreaChart_ee').delay(900).css('display', 'block');
}