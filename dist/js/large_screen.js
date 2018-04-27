'use strict';

var HEADER = 'http://172.16.31.249:8040/lift/';
// 实例化一个地图
var map = new AMap.Map('distribution-map', {
  resizeEnable: true,
  zoom: 5,
  center: [104.06, 30.67],
  // mapStyle: 'amap://styles/whitesmoke'
  mapStyle: 'amap://styles/ddccac9ee871c90fd406a332b04c9b32'
});
// 清除地图覆盖物
map.clearMap();

// 报警实时运行状态确认按钮
var confirmAlarm = function confirmAlarm(dom) {
  var liftId = dom.getAttribute('data-id');
  sessionStorage.setItem('alarmLiftId', liftId);
  window.location.href = '../html/lifts_manage.html';
};

//获取电梯的详细信息
var getLiftInfo = function getLiftInfo() {
  $.ajax({
    type: 'get',
    data: {
      page: 1,
      pagesize: 10
    },
    url: HEADER + "bigScreen/check_liftDistribution.do",
    success: function success(data) {
      for (var i = 0; i < data.data.list.length; i++) {
        var content = void 0;
        var typeValue = void 0;
        if (data.data.list[i].fault_status) {
          content = '<div class="wave ripple danger">\n                            <div class="circle"></div>\n                            <div class="circle"></div>\n                            <div class="circle"></div>\n                            <div class="warning">\n                            </div>\n                        </div>\n                 ';
          typeValue = 'danger';
        } else {
          if (data.data.list[i].online_status) {
            content = '<div class="safe"></div> ';
            typeValue = 'safe';
          } else {
            content = '<div class="offline"></div>          ';
            typeValue = 'offline';
          }
        }
        constructStateMark(data.data.list[i].longitude, data.data.list[i].latitude, content, data.data.list[i].id, typeValue);
      }

      $(".mapTitle span").html(data.data.counts);
    }
  });
};

// 构建电梯状态标记
var constructStateMark = function constructStateMark(long, lat, content, id, typeValue) {
  if (long !== '' && lat !== '') {
    var newMarker = new AMap.Marker({
      map: map,
      // position: [marker.longitude, marker.latitude],
      position: [long, lat], //静态数据
      offset: new AMap.Pixel(0, 0),
      content: content //自定义点标记覆盖物内容
    });
    newMarker.id = id;
    newMarker.typeValue = typeValue;
    newMarker.on('click', liftMarkerClick);
  }
};

//地图中的自定义标记绑定点击事件(电梯实时状态)
var liftMarkerClick = function liftMarkerClick(e) {
  getMapLiftInfo(e.target.id, e.target.typeValue);
};

// 显示地图标题和报警类型
var showMapTitleAndAlarmType = function showMapTitleAndAlarmType() {
  var str = ' <div class="mapTitle">\u7535\u68AF\u5B89\u88C5\u5206\u5E03\uFF1A<span></span>\u53F0</div>\n              <ul class="typeUl">\n                  <li><div class="green"></div><span>\u6B63\u5E38</span></li>\n                  <li><div class="red"></div><span>\u62A5\u8B66</span></li>\n                  <li><div class="grey"></div><span>\u79BB\u7EBF</span></li>\n              </ul>\n              ';
  $('#distribution-map').append(str);
};

// 获取地图中电梯的详细信息数据
var getMapLiftInfo = function getMapLiftInfo(id, typeValue) {
  $.ajax({
    type: 'get',
    data: {
      id: id
    },
    url: HEADER + "bigScreen/check_getLiftByLiftIdToBigScreen.do",
    success: function success(data) {
      showMapLiftInfo(data.data, typeValue);
    }
  });
};

// 显示地图中电梯的详细信息
var showMapLiftInfo = function showMapLiftInfo(data, typeValue) {
  var showFaultType = '';
  if (typeValue === 'danger') {
    showFaultType = ' <p title="">' + data['fault_type'] + '</p>';
  }
  var str = '  <div class="meterInfo">\n                    <div class="title">\u5728\u7EBF\u76D1\u63A7\u88C5\u7F6E</div>\n                    <p title="">\u5355\u4F4D\u540D\u79F0:' + data.lname + '</p>\n                    <p title="">\u8BBE\u5907\u5185\u90E8\u7F16\u53F7:' + data['unit_id'] + '</p>\n                    ' + showFaultType + '\n                </div>\n              ';
  $('#distribution-map').find('.meterInfo').remove().end().append(str);
};

//请求最新报警列表数据
var getNewAlarmList = function getNewAlarmList() {
  $.ajax({
    type: 'get',
    data: {
      page: 1,
      pagesize: 10
    },
    url: HEADER + "bigScreen/check_newFaultLift.do",
    success: function success(data) {
      constructNewAlarmList(data.data.list);
    }
  });
};

//构造最新报警列表
var constructNewAlarmList = function constructNewAlarmList(data) {
  var str = '';
  for (var i = 0; i < data.length; i++) {
    str += '<li onclick="confirmAlarm(this);" data-id="' + data[i].lift_id + '">\n                           <div title="' + (i + 1) + '\u3001' + data[i].lname + '" class="left">' + (i + 1) + '\u3001' + data[i].lname + '</div>\n                           <div class="center">\n                               <span class="user"></span>\n                               <span title="\u7EF4\u4FDD\u4EBA\u5458:' + data[i].maint_staffs_names + '"  class="text">\u7EF4\u4FDD\u4EBA\u5458:' + data[i].maint_staffs_names + '</span>\n                           </div>\n                           <div class="right">\n                               <span class="alarmType"></span>\n                               <span title="\u7EF4\u4FDD\u4EBA\u5458:' + data[i].fault_type + '" class="text">\u62A5\u8B66\u7C7B\u578B:' + data[i].fault_type + '(' + data[i].fault_value + ')</span>\n                           </div>\n                       </li>';
  }
  $(".new-alarm ul").html('').html(str);
};

// 设置当前时间
var setCurrentTime = function setCurrentTime() {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var date = today.getDate();
  var hour = today.getHours();
  var minute = today.getMinutes();
  var second = today.getSeconds();
  var currentTime = void 0;
  // 时分秒小于十则在前面加0
  {
    if (hour < 10) {
      hour = '0' + hour;
    }
    if (minute < 10) {
      minute = '0' + minute;
    }
    if (second < 10) {
      second = '0' + second;
    }
  }
  currentTime = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;
  document.getElementById('time-bar').innerText = currentTime;
};

//跳转到设备状态统计页面方法
var jumpTo = function jumpTo(params) {
  var state = params.name;
  console.log(state);
  var stateValue = void 0;
  if (state.indexOf('未处理') >= 0) {
    stateValue = 1;
  }
  if (state.indexOf('已处理') >= 0) {
    stateValue = 3;
  }
  window.location.href = '../html/alarm_statistics.html?page=1&pageSize=10&stateValue=' + stateValue;
};

//日期
setCurrentTime();
setInterval(function () {
  setCurrentTime();
}, 1000);

var scrollNews = function scrollNews(obj) {
  var $self = obj.find("ul:first");
  var lineHeight = $self.find("li:first").height();
  $self.animate({ "marginTop": -lineHeight + "px" }, 600, function () {
    //把所有匹配的元素追加到$self元素的后面,所以才出现这种周而复始滚动的效果
    $self.css({ marginTop: 0 }).find("li:first").appendTo($self);
  });
};
//报警TOP10单位分布------数据处理
var alarmTopList = function alarmTopList() {
  var datalist = [];
  var unitlist = [];
  var dataL = void 0,
      unitL = void 0;
  $.ajax({
    type: 'get',
    url: HEADER + "bigScreen/check_FaultLiftTop10Statistics.do",
    success: function success(data) {
      var dataArr = data.data;
      for (var i = 0; i < dataArr.length; i++) {
        datalist.push(dataArr[i].counts);
        unitlist.push(arrHandel(dataArr[i].lname));
      }
      //倒数组
      dataL = datalist.reverse();
      unitL = unitlist.reverse();
      //画图
      alarmTopDraw('alarmTop', dataL, unitL);
    }
  });
};
//单位字数处理
var arrHandel = function arrHandel(unitArr) {
  var unitL = void 0;
  if (unitArr.length > 6) {
    unitL = unitArr.substr(0, 6) + '...';
  } else {
    unitL = unitArr;
  }
  return unitL;
};

//报警TOP10单位分布-----柱状图dom, seriesData,xAxis
var alarmTopChart = void 0;

var alarmTopDraw = function alarmTopDraw(dom, datalist, unitlist) {
  // 基于准备好的dom，初始化echarts实例
  alarmTopChart = echarts.init(document.getElementById(dom));
  //阴影
  var yMax = datalist[9];
  var dataShadow = [];
  for (var i = 0; i < datalist.length; i++) {
    dataShadow.push(yMax);
  }
  var option = {
    textStyle: {
      color: '#dadada'
    },
    title: {
      text: '报警TOP10单位分布',
      textStyle: {
        color: '#fff',
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b0} : {c0}'
    },
    calculable: true,
    grid: {
      left: '6%',
      bottom: '1%',
      right: '7%',
      containLabel: true
    },
    xAxis: [{
      show: false,
      type: 'value',
      boundaryGap: [0, 0.01]
    }],
    yAxis: [
    //y轴数据
    {
      name: '报警（次）',
      type: 'category',
      data: unitlist,
      axisLine: {
        lineStyle: {
          color: '#68e0cf'
        }
      }
    }],
    //x轴数据
    series: [{
      type: 'bar',
      data: datalist,
      itemStyle: {
        //渐变
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#68e0cf' }, { offset: 1, color: '#209cff' }]),
          //柱形图圆角，初始化效果
          barBorderRadius: [10, 10, 10, 10],
          //顶部数据
          label: {
            show: true, //是否展示
            position: 'right',
            textStyle: {
              fontWeight: 'bolder',
              fontSize: '12'
            }
          }
        },
        emphasis: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#68e0cf' }, { offset: 1, color: '#209cff' }])
        }
      }
    }, { //阴影
      type: 'bar',
      itemStyle: {
        normal: {
          color: 'rgba(0,0,0,0.05)',
          //柱形图圆角，初始化效果
          barBorderRadius: [10, 10, 10, 10]
        }
      },
      barGap: '-100%',
      barCategoryGap: '40%',
      data: dataShadow,
      animation: false
    }]
  };
  // 使用刚指定的配置项和数据显示图表。
  alarmTopChart.setOption(option);
};

//报警处理统计'alarmStatis'
var alarmHandelList = function alarmHandelList() {
  var datalist = [];
  var legendlist = [];
  $.ajax({
    type: 'get',
    url: HEADER + "bigScreen/check_FaultLiftProcessingStatistics.do",
    success: function success(data) {
      var dataArr = data.data;
      for (var i = 0; i < dataArr.length; i++) {
        if (dataArr[i].name !== "处理中") {
          datalist.push({
            'value': dataArr[i].counts,
            'name': dataArr[i].name
          });
          legendlist.push(dataArr[i].name);
        }
      }
      //画图
      alarmHandel('alarmStatis', datalist, legendlist);
    }
  });
};

//报警处理统计'alarmStatis'

var alarmStatisChart = void 0;

var alarmHandel = function alarmHandel(dom, datalist, legendlist) {
  alarmStatisChart = echarts.init(document.getElementById(dom));
  var option = {
    textStyle: {
      color: '#fff'
    },
    color: ['#15c0e5', '#E51944'],
    tooltip: {
      trigger: 'item',
      formatter: "{b} : {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      data: legendlist,
      textStyle: {
        color: '#fff'
      }
    },
    series: [{
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      data: datalist,
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  // 使用刚指定的配置项和数据显示图表。
  alarmStatisChart.setOption(option);
  alarmStatisChart.on('click', function (params) {
    jumpTo(params);
  });
};

/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
alarmHandelList();
alarmTopList();
getNewAlarmList();
showMapTitleAndAlarmType();
getLiftInfo();

// 最新报警滚动显示
var scrollTimer = setInterval(function () {
  scrollNews($(".content-right .content"));
}, 1000);

//柱状图和饼状图适配不同分辨率
window.onresize = function () {
  $('#alarmTop').width('100%');
  $('#alarmStatis').width('100%');
  alarmTopChart.resize();
  alarmStatisChart.resize();
};

/*
* 事件触发
* */
// 鼠标移入清除定时器
$(".content-right .content").on('mouseenter', 'ul', function () {
  console.log('on');
  clearInterval(scrollTimer);
});

// 鼠标移出启动定时器
$(".content-right .content").on('mouseleave', 'ul', function () {
  console.log('off');
  scrollTimer = setInterval(function () {
    scrollNews($(".content-right .content"));
  }, 1000);
});

// 点击跳转
$(".content-right .content").on('click', 'li', function () {
  console.log('111');
});

// 返回
$(".backToHome div").click(function () {
  window.location.href = "../html/home_page.html";
});
//# sourceMappingURL=large_screen.js.map