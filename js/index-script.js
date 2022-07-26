// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

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

// ◇バイタルデータ格納用
var _all_vital_data = {
  time: [],
  pwbgt: [],
  hr: [],
  ee: [],
  iee: []
};


/*
 * 直近グラフ表示用
 */
// ▼コンボボックスに表示する項目（データ表示数）
var _select_num = [{
  type: '15',
  name: '過去15個',
},
{
  type: '30',
  name: '過去30個',
},
{
  type: '60',
  name: '過去60個',
}]; 

// ▼取得するデータの数（コンボボックスの最低値）
var _length = Number( _select_num[0].type );

// ▼取得するデータの最大数（コンボボックスの最大値）
var graph_max_range = Number( _select_num[ _select_num.length - 1 ].name );

// ▼Vue データ（グラフ表示制御用）
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
    // コンボボックスでセレクトされている値（種類）
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
    // コンボボックスに変更があった場合（グラフの種類）
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
        // ▼心拍数
        case 'hr': 
          this.datasets = this.hr_data.main;
          this.levels.warning = this.hr_data.warning;
          this.levels.danger = this.hr_data.danger;
          break;
        // ▼pwbgt
        case 'pwbgt':
          this.datasets = this.pwbgt_data.main;
          this.levels.warning = this.pwbgt_data.warning;
          this.levels.danger = this.pwbgt_data.danger;
          break;
        // ▼活動量
        case 'ee':
          this.datasets = this.ee_data.main;
          this.levels.warning = this.ee_data.warning;
          this.levels.danger = this.ee_data.danger;
          break;
        // ▼累計活動量
        case 'iee':
          this.datasets = this.iee_data;
          this.levels.warning = [];
          this.levels.danger = [];
          break;
      }
    },
    // ▼警告・危険値のセット
    setAlertData () {   
      for ( var i = 0; i < graph_max_range; i++ ) {
        // ▼心拍数
        this.hr_data.warning[i] = _alert.hr.warning;
        this.hr_data.danger[i] = _alert.hr.danger;
        // ▼pwbgt
        this.pwbgt_data.warning[i] = _alert.pwbgt.warning;
        this.pwbgt_data.danger[i] = _alert.pwbgt.danger;
        // ▼活動量
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
  getLoginInfo();
  //login_name.textContent = `<span class="mr-2 d-none d-lg-inline text-gray-600 small">${login_person}</span>`;

  // コンボボックス表示 ～表示数のみ～　（表示データは Vue で管理）
  CombManager();

  // 初回表示
  post_send();

  // 繰り返し処理
  setInterval("post_send()", 60000);

  // url のパラメータを削除
  // SCRIPTタグの生成
  var del_url_script = document.createElement("script");
  
  // SCRIPTタグのSRC属性に読み込みたいファイルを指定
  del_url_script.src = "js/del-url-parameter.js";
  
  // BODY要素の最後に追加
  document.body.appendChild ( del_url_script );
});


/**
 * ログイン情報の取得
 */
function getLoginInfo() {

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
}


/**
 * コンボボックスの管理 （表示数のみ）
 */
function CombManager() {
    // コンボボックスのインスタンス
    var select = document.getElementById( 'select_num' );

    // 表示する項目をセット
    _select_num.forEach( item => {
      select.add( new Option( item.name, item.type ) );  // Option( 表示項目, value )
    } );
  
    // コンボボックスの変更を監視
    select.onchange = function() {
  
      // 選択されているoption要素を取得する
      var selectedItem = this.options[ this.selectedIndex ];
  
      // 変更されたバリューを記憶しておく
      _length = Number( selectedItem.value );
  
      // グラフを更新する
      post_send();
    }
}


/**
 * post で Lambda とデータのやり取りを行う
 */
function post_send() {

  // 送信する json ファイルの作成
  var jsonData = {
    "value1": login_person // urlの引数を取得
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
      
      // 各カードの値を変更する
      changeCardData();

      // プログレスバーの表示
      update_progress();
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
    
    // ◇値の格納
    // 累計活動量の計算
    iee_num += item["ee"];

    // 各配列にデータを格納する
    time.push(item["jikan"]);
    hr.push(parseFloat(item["hr"]));
    pwbgt.push(parseFloat(item["pwbgt"]));
    ee.push(item["ee"]);
    iee.push(iee_num);
  });


  // ◇バイタルデータをグローバル変数に格納
  _all_vital_data.time = time;
  _all_vital_data.pwbgt = pwbgt;
  _all_vital_data.hr = hr;
  _all_vital_data.ee = ee;
  _all_vital_data.iee = iee;


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
  var hr_dataset_now = _all_vital_data.hr;        // 心拍数
  var pwbgt_dataset_now = _all_vital_data.pwbgt;  // pwbgt
  var ee_dataset_now = _all_vital_data.ee;        // 活動量
  var iee_dataset_now = _all_vital_data.iee;      // 累計活動量

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
                     .text ( _percent.hr + '%' )
                     .prop ( 'aria-valuenow', _percent.hr );
    $('#hr-icon').html (`<i class="fas fa-dizzy fa-lg faa-tada animated text-danger"></i>`);
    $('#hr-text').html (`<span class="text-danger">危険</span>`);
  }
  else if ( _warning <= _percent.hr ) {
    // 警告表示
    $('#hr-progress').css ( 'width', _percent.hr + '%' )
                     .css ( 'background-color', '#f6c23e' )
                     .text ( _percent.hr + '%' )
                     .prop ( 'aria-valuenow', _percent.hr );
    $('#hr-icon').html (`<i class="fas fa-tired fa-lg faa-ring animated text-warning"></i>`);
    $('#hr-text').html (`<span class="text-warning">警告</span>`);
  }
  else {
    // 通常表示
    $('#hr-progress').css ( 'width', _percent.hr + '%' )
                     .css ( 'background-color', '#4e73df' )
                     .text ( _percent.hr + '%' )
                     .prop ( 'aria-valuenow', _percent.hr );
    $('#hr-icon').html (`<i class="fas fa-smile fa-lg faa-pulse animated text-primary"></i>`);
    $('#hr-text').html (`<span class="text-primary">平常</span>`);
  }

  // ▼ pwbgt
  if ( _danger <= _percent.pwbgt ) {
    // 危険表示
    $('#pwbgt-progress').css ( 'width', _percent.pwbgt + '%' )
                        .css ( 'background-color', '#e74a3b' )
                        .text ( _percent.pwbgt + '%' )
                        .prop ( 'aria-valuenow', _percent.pwbgt );
    $('#pwbgt-icon').html (`<i class="fas fa-dizzy fa-lg faa-tada animated text-danger"></i>`);
    $('#pwbgt-text').html (`<span class="text-danger">危険</span>`);
  }
  else if ( _warning <= _percent.pwbgt ) {
    // 警告表示
    $('#pwbgt-progress').css ( 'width', _percent.pwbgt + '%' )
                        .css ( 'background-color', '#f6c23e' )
                        .text ( _percent.pwbgt + '%' )
                        .prop ( 'aria-valuenow', _percent.pwbgt );
    $('#pwbgt-icon').html (`<i class="fas fa-tired fa-lg faa-ring animated text-warning"></i>`);
    $('#pwbgt-text').html (`<span class="text-warning">警告</span>`);
  }
  else {
    // 通常表示
    $('#pwbgt-progress').css ( 'width', _percent.pwbgt + '%' )
                        .css ( 'background-color', '#4e73df' )
                        .text ( _percent.pwbgt + '%' )
                        .prop ( 'aria-valuenow', _percent.pwbgt );
    $('#pwbgt-icon').html (`<i class="fas fa-smile fa-lg faa-pulse animated text-primary"></i>`);
    $('#pwbgt-text').html (`<span class="text-primary">平常</span>`);
  }

  // ▼ 活動量
  if ( _danger <= _percent.ee ) {
    // 危険表示
    $('#ee-progress').css ( 'width', _percent.ee + '%' )
                     .css ( 'background-color', '#e74a3b' )
                     .text ( _percent.ee + '%' )
                     .prop ( 'aria-valuenow', _percent.ee );
    $('#ee-icon').html (`<i class="fas fa-dizzy fa-lg faa-tada animated text-danger"></i>`);
    $('#ee-text').html (`<span class="text-danger">危険</span>`);
  }
  else if ( _warning <= _percent.ee ) {
    // 警告表示
    $('#ee-progress').css ( 'width', _percent.ee + '%' )
                     .css ( 'background-color', '#f6c23e' )
                     .text ( _percent.ee + '%' )
                     .prop ( 'aria-valuenow', _percent.ee );
    $('#ee-icon').html (`<i class="fas fa-tired fa-lg faa-ring animated text-warning"></i>`);
    $('#ee-text').html (`<span class="text-warning">警告</span>`);
  }
  else {
    // 通常表示
    $('#ee-progress').css ( 'width', _percent.ee + '%' )
                     .css ( 'background-color', '#4e73df' )
                     .text ( _percent.ee + '%' )
                     .prop ( 'aria-valuenow', _percent.ee );
    $('#ee-icon').html (`<i class="fas fa-smile fa-lg faa-pulse animated text-primary"></i>`);
    $('#ee-text').html (`<span class="text-primary">平常</span>`);
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