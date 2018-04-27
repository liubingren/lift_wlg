const HEADER = 'http://172.16.31.249:8040/lift/'
// 实例化一个地图
let map = new AMap.Map('distribution-map', {
  resizeEnable: true,
  zoom: 5,
  center: [104.06, 30.67],
  // mapStyle: 'amap://styles/whitesmoke'
  mapStyle: 'amap://styles/ddccac9ee871c90fd406a332b04c9b32'
})
// 清除地图覆盖物
map.clearMap();

// 报警实时运行状态确认按钮
const confirmAlarm = (dom) => {
  let liftId = dom.getAttribute('data-id');
  sessionStorage.setItem('alarmLiftId', liftId);
  window.location.href = '../html/lifts_manage.html';
}

//获取电梯的详细信息
const getLiftInfo = () => {
  $.ajax({
    type: 'get',
    data: {
      page: 1,
      pagesize: 10
    },
    url: HEADER + "bigScreen/check_liftDistribution.do",
    success: (data) => {
      for (let i = 0; i < data.data.list.length; i++) {
        let content;
        let typeValue;
        if (data.data.list[i].fault_status) {
          content = `<div class="wave ripple danger">
                            <div class="circle"></div>
                            <div class="circle"></div>
                            <div class="circle"></div>
                            <div class="warning">
                            </div>
                        </div>
                 `
          typeValue = 'danger';
        } else {
          if (data.data.list[i].online_status) {
            content = `<div class="safe"></div> `
            typeValue = 'safe';
          } else {
            content = `<div class="offline"></div>          `
            typeValue = 'offline';
          }
        }
        constructStateMark(data.data.list[i].longitude, data.data.list[i].latitude, content, data.data.list[i].id,typeValue);
      }

      $(".mapTitle span").html(data.data.counts)
    }
  })

}

// 构建电梯状态标记
const constructStateMark = (long, lat, content, id,typeValue) => {
  if(long!==''&&lat!==''){
    let newMarker = new AMap.Marker({
      map: map,
      // position: [marker.longitude, marker.latitude],
      position: [long, lat],   //静态数据
      offset: new AMap.Pixel(0, 0),
      content: content         //自定义点标记覆盖物内容
    })
    newMarker.id = id;
    newMarker.typeValue = typeValue;
    newMarker.on('click', liftMarkerClick)
  }
}

//地图中的自定义标记绑定点击事件(电梯实时状态)
const liftMarkerClick = (e) => {
  getMapLiftInfo(e.target.id,e.target.typeValue)
}

// 显示地图标题和报警类型
const showMapTitleAndAlarmType = () => {
  let str = ` <div class="mapTitle">电梯安装分布：<span></span>台</div>
              <ul class="typeUl">
                  <li><div class="green"></div><span>正常</span></li>
                  <li><div class="red"></div><span>报警</span></li>
                  <li><div class="grey"></div><span>离线</span></li>
              </ul>
              `
  $('#distribution-map').append(str)
}

// 获取地图中电梯的详细信息数据
const getMapLiftInfo = (id,typeValue) => {
  $.ajax({
    type: 'get',
    data: {
      id: id
    },
    url: HEADER + "bigScreen/check_getLiftByLiftIdToBigScreen.do",
    success: (data) => {
      showMapLiftInfo(data.data,typeValue)
    }
  })
}

// 显示地图中电梯的详细信息
const showMapLiftInfo = (data,typeValue) => {
  let showFaultType = '';
  if (typeValue === 'danger') {
    showFaultType = ` <p title="">${data['fault_type']}</p>`;
  }
  let str = `  <div class="meterInfo">
                    <div class="title">在线监控装置</div>
                    <p title="">单位名称:${data.lname}</p>
                    <p title="">设备内部编号:${data['unit_id']}</p>
                    ${showFaultType}
                </div>
              `
  $('#distribution-map').find('.meterInfo').remove().end().append(str)
}

//请求最新报警列表数据
const getNewAlarmList = () => {
  $.ajax({
    type: 'get',
    data: {
      page: 1,
      pagesize: 10
    },
    url: HEADER + "bigScreen/check_newFaultLift.do",
    success: (data) => {
      constructNewAlarmList(data.data.list)
    }
  })
}

//构造最新报警列表
const constructNewAlarmList = (data) => {
  let str = ``;
  for (let i = 0; i < data.length; i++) {
    str += `<li onclick="confirmAlarm(this);" data-id="${data[i].lift_id}">
                           <div title="${i + 1}、${data[i].lname}" class="left">${i + 1}、${data[i].lname}</div>
                           <div class="center">
                               <span class="user"></span>
                               <span title="维保人员:${data[i].maint_staffs_names}"  class="text">维保人员:${data[i].maint_staffs_names}</span>
                           </div>
                           <div class="right">
                               <span class="alarmType"></span>
                               <span title="维保人员:${data[i].fault_type}" class="text">报警类型:${data[i].fault_type}(${data[i].fault_value})</span>
                           </div>
                       </li>`;
  }
  $(".new-alarm ul").html('').html(str);
}

// 设置当前时间
const setCurrentTime = () => {
  let today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth() + 1
  let date = today.getDate()
  let hour = today.getHours()
  let minute = today.getMinutes()
  let second = today.getSeconds()
  let currentTime
  // 时分秒小于十则在前面加0
  {
    if (hour < 10) {
      hour = '0' + hour
    }
    if (minute < 10) {
      minute = '0' + minute
    }
    if (second < 10) {
      second = '0' + second
    }
  }
  currentTime = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second
  document.getElementById('time-bar').innerText = currentTime
}

//跳转到设备状态统计页面方法
const jumpTo = (params) => {
  let state = params.name
  console.log(state)
  let stateValue
  if (state.indexOf('未处理') >= 0) {
    stateValue = 1;
  }
  if (state.indexOf('已处理') >= 0) {
    stateValue = 3;
  }
  window.location.href = `../html/alarm_statistics.html?page=1&pageSize=10&stateValue=${stateValue}`
}

//日期
setCurrentTime()
setInterval(function () {
  setCurrentTime()
}, 1000)

const scrollNews = (obj) => {
  let $self = obj.find("ul:first");
  let lineHeight = $self.find("li:first").height();
  $self.animate({"marginTop": -lineHeight + "px"}, 600, function () {
    //把所有匹配的元素追加到$self元素的后面,所以才出现这种周而复始滚动的效果
    $self.css({marginTop: 0}).find("li:first").appendTo($self);
  })
}
//报警TOP10单位分布------数据处理
const alarmTopList = () => {
  let datalist = []
  let unitlist = []
  let dataL, unitL
  $.ajax({
    type: 'get',
    url: HEADER + "bigScreen/check_FaultLiftTop10Statistics.do",
    success: (data) => {
      let dataArr = data.data
      for (let i = 0; i < dataArr.length; i++) {
        datalist.push(dataArr[i].counts)
        unitlist.push(arrHandel(dataArr[i].lname))
      }
      //倒数组
      dataL = datalist.reverse()
      unitL = unitlist.reverse()
      //画图
      alarmTopDraw('alarmTop', dataL, unitL);
    }
  })
}
//单位字数处理
const arrHandel = (unitArr) => {
  let unitL
  if (unitArr.length > 6) {
    unitL = unitArr.substr(0, 6) + '...'
  } else {
    unitL = unitArr
  }
  return unitL
}

//报警TOP10单位分布-----柱状图dom, seriesData,xAxis
let alarmTopChart;

const alarmTopDraw = (dom, datalist, unitlist) => {
  // 基于准备好的dom，初始化echarts实例
  alarmTopChart = echarts.init(document.getElementById(dom))
  //阴影
  let yMax = datalist[9];
  let dataShadow = [];
  for (let i = 0; i < datalist.length; i++) {
    dataShadow.push(yMax);
  }
  let option = {
    textStyle: {
      color: '#dadada',
    },
    title: {
      text: '报警TOP10单位分布',
      textStyle: {
        color: '#fff',
        fontWeight: 'normal'
      }
    },
    tooltip : {
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
    xAxis: [
      {
        show: false,
        type: 'value',
        boundaryGap: [0, 0.01]
      }
    ],
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
      }
    ],
    //x轴数据
    series: [
      {
        type: 'bar',
        data: datalist,
        itemStyle: {
          //渐变
          normal: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                {offset: 0, color: '#68e0cf'},
                {offset: 1, color: '#209cff'}
              ]
            ),
            //柱形图圆角，初始化效果
            barBorderRadius: [10, 10, 10, 10],
            //顶部数据
            label: {
              show: true,//是否展示
              position: 'right',
              textStyle: {
                fontWeight: 'bolder',
                fontSize: '12'
              }
            }
          },
          emphasis: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                {offset: 0, color: '#68e0cf'},
                {offset: 1, color: '#209cff'}
              ]
            )
          }
        }
      },
      { //阴影
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
      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  alarmTopChart.setOption(option)
}

//报警处理统计'alarmStatis'
const alarmHandelList = () => {
  let datalist = []
  let legendlist = []
  $.ajax({
    type: 'get',
    url: HEADER + "bigScreen/check_FaultLiftProcessingStatistics.do",
    success: (data) => {
      let dataArr = data.data
      for (let i = 0; i < dataArr.length; i++) {
        if (dataArr[i].name !== "处理中") {
          datalist.push({
            'value': dataArr[i].counts,
            'name': dataArr[i].name
          })
          legendlist.push(dataArr[i].name)
        }
      }
      //画图
      alarmHandel('alarmStatis', datalist, legendlist);
    }
  })
}

//报警处理统计'alarmStatis'

let alarmStatisChart;

const alarmHandel = (dom, datalist, legendlist) => {
  alarmStatisChart = echarts.init(document.getElementById(dom))
  let option = {
    textStyle: {
      color: '#fff',
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
    series: [
      {
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
      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  alarmStatisChart.setOption(option);
  alarmStatisChart.on('click', function (params) {
    jumpTo(params)
  })
}

/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
alarmHandelList()
alarmTopList()
getNewAlarmList();
showMapTitleAndAlarmType();
getLiftInfo();

// 最新报警滚动显示
let scrollTimer = setInterval(function () {
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
  console.log('on')
  clearInterval(scrollTimer)
});

// 鼠标移出启动定时器
$(".content-right .content").on('mouseleave', 'ul', function () {
  console.log('off')
  scrollTimer = setInterval(function () {
    scrollNews($(".content-right .content"));
  }, 1000);
});

// 点击跳转
$(".content-right .content").on('click', 'li', function () {
  console.log('111')
});

// 返回
$(".backToHome div").click(function () {
  window.location.href = "../html/home_page.html"
})