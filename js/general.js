// const HEADER = 'http://172.16.31.231:8040/lift/'   // 建荣主机
const HEADER = 'http://172.16.31.217:8040/lift/'     // 梁锋主机

// 获取当前时间
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
  currentTime = year + '年' + month + '月' + date + '日 ' +
    hour + ':' + minute + ':' + second
  document.getElementById('time-bar').innerText = currentTime
}

// 警报声相关
const playAlarm = {
  audio: new Audio('../alarm.mp3'),
  clickTimes: 0,
  play: function () {
    this.clickTimes = this.clickTimes + 1
    if (this.clickTimes % 2) {
      this.audio.loop = true
      this.audio.play()
    } else {
      this.audio.pause()
    }
  }
}

// 设置头部和导航子元素
const setNavChildren = () => {
  document.getElementById('nav').innerHTML = `
    <div class="home-btn"><a href="../html/home_page.html"><i></i></a></div>
    <ul>
        <li>
            <a href="../html/large_screen.html">
                <i class="big-screen"></i><span>大屏幕</span><i class="nav-arrow"></i>
            </a>
        </li>
        <li onclick="sessionStorage.clear()">
            <a href="../html/lifts_manage.html">
                <i class="lifts-manage"></i><span>电梯管理</span><i class="nav-arrow"></i>
            </a>
            <ul>
                <li><a href="../html/lifts_manage.html">电梯管理</a></li>
                <li><a href="../html/company_annual_check_record.html">维保公司年度自检记录</a></li>
                <li><a href="../html/government_annual_check.html">政府年度检验记录</a></li>
            </ul>
        </li>
        <li>
            <a href="../html/maintenancePlan.html">
                <i class="maintain-plan-manage"></i><span class="maintain-manage">维保计划管理</span><i class="nav-arrow"></i>
            </a>
            <ul>
                <li><a href="../html/maintTemplate_Manage.html">维保模板管理</a></li>
                <li><a href="../html/maintenancePlan.html">维保计划管理</a></li>
            </ul>
        </li>
        <li>
            <a href="../html/workorderManage.html">
                <i class="orders-manage"></i><span>工单管理</span><i class="nav-arrow"></i>
            </a>
        </li>
        <li title="开发中">
            <a href="">
                <i class="devices-manage"></i><span>设备管理</span><i class="nav-arrow"></i>
            </a>
        </li>
        <li title="开发中">
            <a href="">
                <i class="units-manage"></i><span>单位管理</span><i class="nav-arrow"></i>
            </a>
        </li>
        <li title="开发中">
            <a href="">
                <i class="users-manage"></i><span>用户管理</span><i class="nav-arrow"></i>
            </a>
        </li>
        <li>
            <a href="">
                <i class="system-manage"></i><span>系统管理</span><i class="nav-arrow"></i>
            </a>
            <ul>
                <li><a href="../html/role_manage.html">角色管理</a></li>
                <li><a href="../html/permission_manage.html">权限管理</a></li>
                <li><a href="../html/resource_manage.html">资源管理</a></li>
                <li><a href="../html/role_permission.html">角色权限管理</a></li>
            </ul>
        </li>
        <li>
            <a href="../html/log_management.html">
                <i class="logs-manage"></i><span>日志管理</span><i class="nav-arrow"></i>
            </a>
        </li>
    </ul>`
}
const setHeaderChildren = () => {
  let clickTimes = 0
  document.getElementById('header').innerHTML = `
    <div class="time-bar" id="time-bar"></div>
    <div class="system-name"></div>
    <div class="operation-btn">
        <a href="javascript:void(0)"
            onclick="openPop('user-info-pop')
                     getOriginalInfo()">
            <i class="personal-icon"></i>
            <span>个人</span>
        </a>
        <a class="alarm-btn" id="alarm-btn" href="javascript:void(0)"
           onclick="playAlarm.play()">
            <i></i>
            <span>警报声</span>
        </a>
        <a href="../html/login.html">
            <i class="quit-icon"></i>
            <span>退出</span>
        </a>
    </div>`
}

// 根据 body 设置 .wrapper 的宽度
const setWrapperWidth = () => {
  document.getElementById('wrapper').style.width =
    document.body.clientWidth - 260 + 'px'
}

// 根据弹窗ID打开一级弹窗
const openPop = (id) => {
  let thisPop = document.getElementById(id)
  thisPop.style.display = 'block'
  document.getElementById('content').style.visibility = 'hidden'
}

// 打开修改弹窗后获取原本的信息
const getOriginalInfo = () => {
  $.ajax({
    type: 'get',
    url: HEADER + '/home/check_getHomeUserInfo.do',
    success: (data) => {
      let userData = data.data
      document.getElementById('user-name').innerText = userData.username
      document.getElementById('role-name').innerText = userData.rolename
      document.getElementById('pop-full-name').value = userData.name
      document.getElementById('pop-gender').value = userData.sex
      document.getElementById('pop-phone').value = userData.phonenumber
      document.getElementById('pop-email').value = userData.email
    }
  })
}

// 点击切换个人设置选项卡
const togglePopBody = (dom) => {
  let thisId = dom.getAttribute('id')
  if (thisId === 'user-info-tab') {
    let infoBody = document.getElementById('pop-user-info')
    // 切换选项卡样式
    dom.classList.add('active')
    dom.nextElementSibling.classList.remove('active')
    // 切换输入框内容
    infoBody.classList.add('active')
    infoBody.nextElementSibling.classList.remove('active')
    // 给提交按钮设置标志
    document.getElementById('submit-user-info')
      .setAttribute('data-btn', 'information')
  }
  else if (thisId === 'user-pwd-tab') {
    let pwdBody = document.getElementById('pop-user-pwd')
    dom.classList.add('active')
    dom.previousElementSibling.classList.remove('active')
    pwdBody.classList.add('active')
    pwdBody.previousElementSibling.classList.remove('active')
    document.getElementById('submit-user-info')
      .setAttribute('data-btn', 'password')
  }
}

// 验证手机号
// @errorId: 错误提示条ID
const checkPhone = (dom, errorId) => {
  let reg = /^1[3|4|5|7|8][0-9]{9}$/
  let uInfoError = document.getElementById(errorId)
  if (reg.test(dom.value)) {
    uInfoError.style.display = 'none'
  } else {
    uInfoError.style.display = 'block'
  }
}
// 验证邮箱
const checkEmail = (dom, errorId) => {
  let reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
  let uInfoError = document.getElementById(errorId)
  if (reg.test(dom.value)) {
    uInfoError.style.display = 'none'
  }
  else {
    uInfoError.style.display = 'block'
  }
}
// 不能为空函数
const notEmpty = (dom) => {
  let uInfoError = document.querySelector('.not-empty')
  if (dom.value) {
    uInfoError.style.display = 'none'
  }
  else {
    uInfoError.style.display = 'block'
  }
}

// 确认新密码
const confirmPwd = (dom) => {
  let pwdError = document.getElementById('new-pwd-error')
  let newPwd = document.getElementById('new-pwd').value
  if (dom.value !== newPwd) {
    pwdError.style.display = 'block'
  }
  else {
    pwdError.style.display = 'none'
  }
}

// 提交个人信息
const submitUserInfo = () => {
  let userName = document.getElementById('user-name').innerText
  let name = document.getElementById('pop-full-name').value
  let userGender = document.getElementById('pop-gender').value
  let userPhone = document.getElementById('pop-phone').value
  let userEmail = document.getElementById('pop-email').value
  $.ajax({
    type: 'post',
    data: {
      username: userName,
      name: name,
      sex: userGender,
      phonenumber: userPhone,
      email: userEmail
    },
    url: HEADER + '/user/update_UserByself.do',
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      disLoading()
      secondPop(data.code, data.msg)
    }
  })
}

// 提交密码更改
const submitPwd = () => {
  let userName = document.getElementById('user-name').innerText
  let oldPwd = document.getElementById('old-pwd').value
  let newPwd = document.getElementById('new-pwd').value
  let confirmPwd = document.getElementById('confirm-new-password').value
  console.log(userName)
  console.log(oldPwd)
  console.log(newPwd)
  console.log(confirmPwd)
  $.ajax({
    type: 'post',
    data: {
      username: userName,
      oldpwd: oldPwd,
      password: newPwd,
      comfirmpwd: confirmPwd
    },
    url: HEADER + 'user/update_UserPassword.do',
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      disLoading()
      secondPop(data.code, data.msg)
    }
  })
}

// 不同选项卡下提交不同的信息
const distinguishSubmit = function (dom) {
  let dataBtn = $(dom).attr('data-btn')
  if (dataBtn === 'information') {
    submitUserInfo()
  }
  else if (dataBtn === 'password') {
    submitPwd()
  }
}

// 打开二级弹窗
// @resultCode: 后台返回的操作结果代码
// @resultMsg: 后台返回的操作结果文字
const secondPop = (resultCode, resultMsg) => {
  document.getElementById('cover').classList.add('cover')
  let popWindow = document.getElementById('result-pop')
  popWindow.style.display = 'block'
  if (resultCode === 1) {
    popWindow.classList.add('operation-success')
  } else {
    popWindow.classList.add('operation-fail')
  }
  document.getElementById('operation-result').innerText = resultMsg
}

// 打开删除弹窗
const openDelete = (text) => {
  document.getElementById('cover').classList.add('cover')
  document.getElementById('delete-pop').style.display = 'block'
  document.getElementById('delete-text').innerText = text
}

// 根据弹窗ID关闭弹窗（包括一级与二级）
// @id: 仅为一级弹窗ID,用在二级菜单时不用传
const closeBtn = (dom, id) => {
  let thisClassList = dom.classList
  let cover = document.getElementById('cover')

  // 如果是一级菜单
  if (thisClassList.contains('close-btn')) {
    document.getElementById(id).style.display = 'none'
    document.getElementById('content').style.visibility = 'visible'
    // 如果遮罩层存在
    if (cover.classList.contains('cover')) {
      cover.classList.remove('cover')
    }
  }
  // 如果是二级菜单
  else if (thisClassList.contains('second-close-btn')) {
    let resultClassList = document.getElementById('result-pop').classList
    // 如果显示成功
    if (resultClassList.contains('operation-success')) {
      let popArr = document.querySelectorAll('.close-pop')
      for (let i = 0; i < popArr.length; i++) {
        popArr[i].style.display = 'none'
      }
      resultClassList.remove('operation-success')
      cover.classList.remove('cover')
      document.getElementById('content').style.visibility = 'visible'
    }
    // 如果显示失败
    else if (resultClassList.contains('operation-fail')) {
      resultClassList.remove('operation-fail')
      document.getElementById('result-pop').style.display = 'none'
      cover.classList.remove('cover')
    }
  }
}

// 加载中动画
const loading = () => {
  document.getElementById('loading').style.display = 'block'
  document.getElementById('cover').classList.add('cover')
}
// 撤销加载中动画
const disLoading = () => {
  document.getElementById('loading').style.display = 'none'
  document.getElementById('cover').classList.remove('cover')
}

// 包含翻页函数的对象
const Page = {
  currentPage: 1, // 用于保存当前页码
  // 显示总页数和总数据量
  // data是获取页数的接口返回的 data, 因此此方法要在加载列表的函数里调用
  loadTotalPage: function (data) {
    let THIS = this

    // 当数据总数大于每页显示数量时, 才显示分页栏
    if (data.allRow > data.pageSize) {
      $('#page-bar').css('display', 'flex')
      // 显示总页数
      document.getElementById('total-page').innerText = data.totalPage
      // 显示总数据量
      document.getElementById('total-data').innerText = '共' + data.allRow + '条'
    }
    else {
      $('.page-bar').css('display', 'none')
    }
  },

  // 上下首尾翻页
  // @btnClass: 翻页按钮的 class, 用于判断是 '上下首位' 按钮
  // @fn: 加载列表的函数
  // @paramsNum: 形参个数
  // @...fnParamsArr: fn 所需传入的参数,可接受多个,
  // 注意 fn 定义时, 接受请求的页码的参数必须放在最后
  pageTurning: function (btnClass, fn, paramsNum, ...fnParamsArr) {
    let THIS = this
    let totalPage = document.getElementById('total-page').innerText

    {
      if (btnClass === 'first-page') {
        THIS.currentPage = 1
      }
      else if (btnClass === 'next-page' && (THIS.currentPage < totalPage)) {
        THIS.currentPage += 1
      }
      else if (btnClass === 'pre-page' && (THIS.currentPage > 1)) {
        THIS.currentPage -= 1
      }
      else if (btnClass === 'last-page') {
        THIS.currentPage = totalPage
      }
    }

    // 如果实参少于形参, 则将 undefined 传给多余的形参
    if (fnParamsArr.length < paramsNum - 1) {
      let originalLength = fnParamsArr.length
      fnParamsArr.length = paramsNum - 1
      for (let i = paramsNum - 1 - originalLength; i < originalLength - 1; i++) {
        fnParamsArr[i] = undefined
      }
    }

    fnParamsArr.push(THIS.currentPage)    // 这就是页码参数必须放在最后的原因
    fn(...fnParamsArr)

    // 显示当前页
    document.getElementById('current-page').innerText = THIS.currentPage
  },

// 跳转到指定页数
// @inputPage: 输入的页数, 其余同上
  jumpIntoPage: function (inputPage, fn, paramsNum, ...fnParamsArr) {
    let THIS = this
    let totalPage = document.getElementById('total-page').innerText
    inputPage = parseInt(inputPage)
    totalPage = parseInt(totalPage)
    if (inputPage <= totalPage) {
      THIS.currentPage = inputPage

      if (fnParamsArr.length < paramsNum - 1) {
        let originalLength = fnParamsArr.length
        fnParamsArr.length = paramsNum - 1
        for (let i = paramsNum - 1 - originalLength; i < originalLength - 1; i++) {
          fnParamsArr[i] = undefined
        }
      }

      fnParamsArr.push(THIS.currentPage)
      fn(...fnParamsArr)

      // 显示当前页
      document.getElementById('current-page').innerText = THIS.currentPage
    }
  }
}

// 警报弹窗
// 连接 websocket
const connectWebSocket = function connectWebSocket () {
  let websocket
  if ('WebSocket' in window) {
    websocket = new WebSocket("ws://172.16.31.231:8040/lift/websocket.do")
  } else if ('MozWebSocket' in window) {
    websocket = new MozWebSocket("ws://172.16.31.231:8040/lift/websocket.do")
  } else {
    websocket = new SockJS("http://172.16.31.231:8040/lift/sockjs/websocket.do")
  }
  // 打开时
  websocket.onopen = function (evnt) {
    // console.log("websocket.onopen")
  };
  // 处理消息时
  websocket.onmessage = function (evnt) {

    let json = JSON.parse(evnt.data)
    let liftId = json.lift_id
    if (liftId) {
      document.getElementById('alarm-pop').style.display = 'block'
      document.getElementById('cover').classList.add('cover')
      playAlarm.play()

      document.getElementById('alarm-pop-register-code').innerText = json.id_nr
      document.getElementById('alarm-pop-install-addr').innerText = json.inst_addr
      document.getElementById('alarm-pop-inside-code').innerText = json.unit_id
      document.getElementById('alarm-pop-current-floor').innerText = json.car_position
      document.getElementById('confirm-alarm-btn').setAttribute('data-id', liftId)

      let passengerStatus = document.getElementById('alarm-pop-anybody')
      let doorStatus = document.getElementById('alarm-pop-whether-close')
      if (!json.door_status) {
        doorStatus.innerText = json.door_status + '(无关门到位信号)'
        doorStatus.classList.add('warning')
      } else {
        doorStatus.innerText = json.door_status + '(关门到位)'
        if (doorStatus.classList.contains('warning')) {
          doorStatus.classList.remove('warning')
        }
      }
      if (json.passenger_status) {
        passengerStatus.innerText = json.passenger_status + '(有人)'
      } else {
        passengerStatus.innerText = json.passenger_status + '(无人)'
      }
    }
  }
  websocket.onerror = function (evnt) {
    // connectWebSocket();
  }
  websocket.onclose = function (evnt) {
    // connectWebSocket();
  }
  // 发送消息
  //websocket.send(JSON.stringify(msg));
}
// 报警实时运行状态确认按钮, 跳转到详情页
const confirmAlarm = (dom) => {
  let liftId = dom.getAttribute('data-id')
  sessionStorage.setItem('alarmLiftId', liftId)
  window.location.href = '../html/lifts_manage.html'
}

/*上面是函数定义区, 下面是代码执行区**********************************************/

setNavChildren()
setHeaderChildren()

setCurrentTime()
setInterval(function () {
  setCurrentTime()
}, 1000)

// 设置 .wrapper 的宽度
setWrapperWidth()

connectWebSocket()

// // 在自己页面的js里调用
//window.onresize = function () {
// setWrapperWidth()
// }
