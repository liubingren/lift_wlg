// 设置.lifts-status的宽度
const setLiftsStatusWidth = () => {
  document.getElementById('lifts-status').style.width =
    document.getElementById('content').clientWidth - 360 + 'px'
}

// 绘制环形图
// 绘制饼图
const drawDoughnut = (seriesData) => {
  let homeChart = echarts.init(document.getElementById('status-doughnut'))
  let p = '%'
  let homeChartOption = {
    color: [
      '#ff1f59',
      '#bfbfbf',
      '#a9d86e',
      '#f8a20f'
    ],
    tooltip: {
      backgroundColor: '#fff',
      formatter: '{c}<span style="font-size: 17px;font-weight: 300;width: 10px;">台</span>' +
      '<div style="font-size: 17px;font-weight: 300;color:#a4b5c7;letter-spacing: 10px">' +
      '{b}</div>',
      position: ['43%', '37%'],
      textStyle: {
        fontSize: 45,
        fontWeight: '700',
        color: '#202133'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        label: {
          show: true,
          position: 'outside',
          color: '#fff',
          fontSize: '16',
          formatter: '{d|{d}%}\n' +
          '{b|{b}}',
          rich: {
            d: {
              fontSize: 30,
              color: '#202133',
              fontWeight: '700'
            },
            b: {
              fontSize: 15,
              color: '#a4b5c7'
            }
          }
        },
        labelLine: {
          length: 40,
          lineStyle: {
            color: '#000'
          }
        },
        data: seriesData
      }
    ]
  }

  homeChart.setOption(homeChartOption)
}

// 获取电梯数据
const getLiftsStatusData = () => {
  let liftsArr
  axios.get(HEADER + '/home/check_countLiftByStatus.do')
    .then(function (response) {
      let data = response.data.data.data
      let totalCounts = response.data.data.counts
      liftsArr = [
        {value: data.alarm_counts, name: '报警电梯'},
        {value: data.offline_counts, name: '离线电梯'},
        {value: data.online_counts, name: '正常电梯'},
        {value: data.pre_alarm_counts, name: '预警电梯'}
      ]
      drawDoughnut(liftsArr)
      homePageVM.totalLifts = totalCounts
      homePageVM.normalLists = data.online_counts
      homePageVM.earlyWarningLifts = data.pre_alarm_counts
      homePageVM.warningLifts = data.alarm_counts
      homePageVM.offlineLifts = data.offline_counts
    })
    .catch(function (error) {
      console.log(error)
    })
}

// 获取用户信息
const getUserData = () => {
  loading()
  axios({
    method: 'get',
    url: HEADER + '/home/check_getHomeUserInfo.do'
  })
    .then(
      function (response) {
        disLoading()
        let userData = response.data.data
        homePageVM.name = userData.name
        homePageVM.roleName = userData.rolename
        homePageVM.companyName = userData.companyname
        homePageVM.companyAddr = userData.companyaddr
        homePageVM.phoneNum = userData.phonenumber
        homePageVM.emailAddr = userData.email
        homePageVM.contactUnits = userData.unitcount
      })
    .catch(function (error) {
      console.log(error)
    })
}

/*上面是函数定义区, 下面是代码执行区**********************************************/

let homePageVM = new Vue({
  el: '#home-page',
  data: {
    // 电梯数据
    totalLifts: 0,
    normalLists: 0,
    earlyWarningLifts: 0,
    warningLifts: 0,
    offlineLifts: 0,
    // 用户信息
    name: '',
    roleName: '',
    companyName: '',
    // 基本信息
    companyAddr: '',
    phoneNum: '',
    emailAddr: '',
    contactUnits: ''
  }
})

setLiftsStatusWidth()
window.onresize = function () {
  setWrapperWidth()
  setLiftsStatusWidth()
}

getLiftsStatusData()

getUserData()