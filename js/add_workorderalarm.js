
//let HEADER = 'http://172.16.31.231:8040/lift'
//let workOrderId = '4028358162619669016261bfd5da0399'
//获取url中的参数值
const parseQueryString = (url) => {
  let json = {}
  let arr = url.substr(url.indexOf('?') + 1).split('&')
  arr.forEach(function (item) {
    let tmp = item.split('=')
    json[tmp[0]] = tmp[1]
  })
  return json
}

//工单id和操作类型
let workOrderId = parseQueryString(window.location.href).orderId;
let action = parseQueryString(window.location.href).action;

if(action === 'watch' || action === 'watchfromdetailed'){
   $(".btnBar").css('display','none')
   $("#examineState,#examineremarks").css({"background-color": "rgba(46, 89, 189, 0.15)","cursor":"text"}).prop('disabled',true)
   $("#examineState + ul").html('')
   $(".form-title span").html('查看报警工单')
}
//获取报警工单信息
const getWorkOrderInfo = () => {
  let url = HEADER +'/workAlarm/check_getWorkAlarmById.do'
  let html = ''
  $.ajax({
    type: 'get',
    data: {
      id:workOrderId
    },
    url: url,
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      disLoading()
      let dataList = data.data
      $('#village').val(!!dataList.user ? dataList.user : '')
      $('#alertTime').val(!!dataList.alarm_time ? dataList.alarm_time : '')
      $('#add_rescueTime').val(!!dataList.rescue_time ? dataList.rescue_time : '')
      $('#add_rescuedTime').val(!!dataList.was_rescue_time ? dataList.was_rescue_time : '')
      $('#remarks').val(!!dataList.remark ? dataList.remark : '')
      let code = dataList.order_status
      let status
      if (code === 3) {
        status = "已处理"
      } else if (code === 2) {
        status = "处理中"
      } else if (code === 1) {
        status = "未处理"
      }
      $("#handleState").attr({'title': status,'stateType': code}).html(status)
      $("#maintenancepeople").attr({'title': !!dataList.maint_staff_value ? dataList.maint_staff_value : '请选择维保人员',peopleType:dataList.maint_staff}).html(!!dataList.maint_staff_value ? dataList.maint_staff_value : '请选择维保人员')
      $('#maintenanceCom').val(!!dataList.maint_comp ? dataList.maint_comp : '')
      html += `<tr data-lift_id="${dataList.lift_id}">
         <td>${!!dataList.id_nr ? dataList.id_nr : ''}</td>
         <td>${!!dataList.unit_id ? dataList.unit_id : ''}</td>
         <td>${!!dataList.inst_addr ? dataList.inst_addr : ''}</td>
       </tr>`
      $("#liftsInfo").html(html)

      //审核
      let code1 = dataList.check_status
      let status1
      if (code1 === 3) {
        status1 = "已审核"
      } else if (code1 === 2) {
        status1 = "审核未通过"
      } else if (code1 === 1) {
        status1 = "未审核"
      }
      $('#rescueTime').val(!!dataList.rescue_time ? dataList.rescue_time : '暂无数据')
      $('#rescuedTime').val(!!dataList.was_rescue_time ? dataList.was_rescue_time : '暂无数据')
      $("#examineState").attr({'title':status1,'examineType':code1}).html(status1)
      $("#examineremarks").val(!!dataList.check_opinions ? dataList.check_opinions : '')

      if(action === 'watchfromdetailed'){
        $(".back").attr('data-id',dataList.lift_id)
      }
    }

  })
}
//获取维保人
const getMaintpeople = () =>{
  let url = HEADER +'/workOrder/check_listMaintStaffs.do'
  let html = ''
  $.ajax({
    type: 'get',
    url: url,
    success: (data) => {
      let dataList = data.data
      for(let i = 0; i < dataList.length; i++){
        html += `<li title="${!!dataList[i].maint_staff_value ? dataList[i].maint_staff_value  :''}" peopleType="${dataList[i].maint_staff}">${!!dataList[i].maint_staff ? dataList[i].maint_staff_value  :'' }</li>`
      }
      $("#maintpeople").html(html)
    }
  })
}

//提交编辑信息
const postInfor = () =>{
  let url = HEADER + '/workAlarm/update_WorkAlarm.do'
  let lift_id = $("#liftsInfo tr").attr('data-lift_id')
  let rescue_time = $("#add_rescueTime").val()
  let was_rescue_time = $("#add_rescuedTime").val()
  let maint_staff = $("#maintenancepeople").attr('peopleType')
  let remark = $("#remarks").val();
  let order_status = $("#handleState").attr('stateType')
  let flag = true;
  if(was_rescue_time === ''){
    flag = false
    secondPop('0',"请选择完成救授时间！")
  }
  if(rescue_time === ''){
    flag = false
    secondPop('0',"请选择到场救授时间！")
  }
  if(!!flag){
    $.ajax({
      type: 'post',
      data: {
        id: workOrderId,
        lift_id: lift_id,
        rescue_time: rescue_time,
        was_rescue_time: was_rescue_time,
        maint_staff: maint_staff,
        remark:remark,
        order_status:order_status
      },
      url: url,
      success: (data) => {
        secondPop(data.code,data.msg)
        if(data.code === 1){
          $('.second-close-btn').click(function () {
            window.location.href = `../html/workorderManage.html?orderType=workAlarm`
          })
        }
      }
    })
  }
}

//审核报警工单
const examineOrder = () =>{
  let check_status = $("#examineState").attr('examineType');
  let check_opinions = $("#examineremarks").val()
  let url = HEADER + '/workAlarm/approval_WorkAlarm.do'
  let flag = true;
  if(check_status === 2){
    flag = false
    secondPop('0',"请填写审核意见！")
  }
  if(!!flag){
    $.ajax({
      type: 'post',
      data: {
        id: workOrderId,
        check_status:check_status,
        check_opinions:check_opinions
      },
      url: url,
      success: (data) => {
        secondPop(data.code,data.msg)
        if(data.code === 1){
          $('.second-close-btn').click(function () {
            window.location.href = `../html/workorderManage.html?orderType=workAlarm`
          })
        }
      }
    })

  }
}

const backBtn =(dom)=>{
    if(action === 'watchfromdetailed'){
      //window.location.href = `../html/lifts_manage.html`
      //返回电表详细页
      confirmAlarm(dom)
    }else{
      window.location.href = `../html/workorderManage.html?orderType=workAlarm`
    }
}

/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
window.onresize = function () {
  setWrapperWidth()
}


//时间选择器
laydate.render({
  elem: '#add_rescueTime',
  type: 'datetime',
  format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
  done: function done (value) {
    $('#add_rescueTime').val(value);
  }
});
laydate.render({
  elem: '#add_rescuedTime',
  type: 'datetime',
  format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
  done: function done (value) {
    $('#add_rescuedTime').val(value);
  }
});

//下拉列表公用
$('.select_box span').click(function () {
  $(this).parent().find('ul.son_ul').show();
  //li的hover效果方法触发 mouseenter 和 mouseleave 事件
  $(this).parent().find('li').hover(function () {
    $(this).addClass('hover');
  }, function () {
    $(this).removeClass('hover');
  });
  $(this).parent().hover(function () {}, function () {
    $(this).parent().find("ul.son_ul").hide();
  });
});
$('ul.son_ul').on('click', 'li', function () {
  let selectText = $(this).closest('.selectText');
  let aSpan=$(this).parents('li').find('span');
  if(aSpan.attr('id')==='handleState'){
    aSpan.attr('stateType',$(this).attr('stateType'))
  }else if(aSpan.attr('id')==='examineState'){
    aSpan.attr('examineType',$(this).attr('examineType'))
  }
  else{
    aSpan.attr('peopleType',$(this).attr('peopleType'))
  }
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title',$(this).html());
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('sex', $(this).text());
  }
  $(this).parents('li').find('ul').hide();
});

getWorkOrderInfo()
getMaintpeople()
