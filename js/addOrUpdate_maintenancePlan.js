//h获取url中的参数值
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
let plan_id = parseQueryString(window.location.href).plan_id;
let action = parseQueryString(window.location.href).action;

//维保模板
let maintTemplate;

//获取维保模板
const getmaintTemplate = () => {
  $.ajax({
    type: 'get',
    url: HEADER + 'maintPlan/check_listMaintTemplate.do',
    success: (data) => {
      console.log(data);
      constructmaintTemplate(data.data);
    }
  })
}

// 构造维保模板列表
const constructmaintTemplate = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li itemAttr="${data[i].template_id}">${data[i].template_name}</li>`;
    };
    maintTemplate=str;
  } else {
    maintTemplate='';
  }
}


//获取小区列表
const getLocationList = () => {
  $.ajax({
    type: 'get',
    url: HEADER + 'maintPlan/check_listLocation.do',
    success: (data) => {
      constructLocationList(data.data);
    }
  }).done(function () {
    // getMaintenanceCompanyList();
    getMaintStaffsList();
  })
}

// 构造小区列表
const constructLocationList = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li id="${data[i].id}">${data[i].name}</li>`;
    }
    $(".locationList .son_ul").html('').html(str);
  } else {
    $(".locationList .son_ul").html('')
  }
}

//GET 根据小区id和月份获取电梯列表
const getLifList = (lid, mon) => {
  $.ajax({
    type: 'get',
    data: {
      lid: lid,
      mon: mon
    },
    url: HEADER + 'maintPlan/check_ListLiftByLidAndMon.do',
    success: (data) => {
      console.log(data);
      constructLifList(data.data)
    }
  }).done(function () {
    //时间选择器(同时绑定多个)
    lay('input[id^="start_time"]').each(function () {
      laydate.render({
        elem: this,
        type: 'datetime',
        format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
        done: function done (value) {
          $("div[id*='layui-laydate']").remove();
          $(this).val(value);
        }
      });
    });
    lay('input[id^="end_time"]').each(function () {
      laydate.render({
        elem: this,
        type: 'datetime',
        format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
        trigger: 'click'
      });
    });

    $('.maintenanceType .select_box span').mousedown(function () {
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

    $('.maintenanceType ul.son_ul li').mousedown(function () {
      let selectText = $(this).closest('.selectText');
      let aSpan = $(this).parents('li').find('span');
      aSpan.html($(this).html() + '<div></div><p></p>').attr('spanAttr', $(this).attr('itemAttr'));
      $(this).parents('li').find('ul').hide();
    });
  })
}

// 构造电梯表格
const constructLifList = (data, func) => {
  console.log(data);
  let str = ``;
  if (data instanceof Array) {
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        str += `<tr>
                            <td><input type="checkbox" lift_id="${data[i].lift_id}"></td>
                            <td>${data[i].id_nr}</td>
                            <td>${data[i].unit_id}</td>
                            <td>
                                 <ul class="maintenanceType selectText" >
                                    <li class="select_box">
                                        <span id="maintenanceSpan${i}" title="请选择维保类型">请选择维保类型</span>
                                        <ul class="son_ul" style="display: none;">
                                            ${maintTemplate}
                                        </ul>
                                    </li>
                                </ul>
                            </td>
                            <td><input type="text" id="start_time${i}"></td>
                            <td><input type="text" id="end_time${i}"></td>
                        </tr>`;
      }
      $(".content_group2 tbody").html('').html(str);
    } else {
      $(".content_group2 tbody").html('')
    }
  } else {
    str += `<tr>
                            <td><input type="checkbox" plan_id="${data.plan_id}"></td>
                            <td>${data.id_nr}</td>
                            <td>${data.unit_id}</td>
                            <td>
                                 <ul class="maintenanceType selectText" >
                                    <li class="select_box">
                                        <span id="maintenanceSpan" title="请选择维保类型">请选择维保类型</span>
                                        <ul class="son_ul" style="display: none;">
                                            ${maintTemplate}
                                        </ul>
                                    </li>
                                </ul>
                            </td>
                            <td><input type="text" id="start_time"></td>
                            <td><input type="text" id="end_time"></td>
                        </tr>`;
    $(".content_group2 tbody").html('').html(str);
    if (func) {
      func();
    }
  }

}

//获取维保公司列表
const getMaintenanceCompanyList = () => {
  $.ajax({
    type: 'get',
    url: HEADER + 'maintPlan/check_listMaintenanceCompany.do',
    success: (data) => {
      console.log(data);
      constructMaintenanceCompanysList(data.data);
    }
  })
}

// 构造维保公司列表
const constructMaintenanceCompanysList = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li itemAttr="${data[i].id}">${data[i].name}</li>`;
    }
    $(".maintenanceCompanyList .son_ul").html('').html(str);
  } else {
    $(".maintenanceCompanyList .son_ul").html('')
  }
}

//获取维保人员列表
const getMaintStaffsList = (func) => {
  $.ajax({
    type: 'get',
    url: HEADER + 'maintPlan/check_listMaintStaffs.do',
    success: (data) => {
      console.log(data);
      constructMaintStaffsList(data.data);
      if(func){
        func();
      }
    }
  }).done(function(){
    getMaintenanceCompanyList();
  })
}

// 构造维保人_员列表
const constructMaintStaffsList = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<div class="radio-wrap-item">
                            <span maint_staff="${data[i].maint_staff}"></span>
                            <i>${data[i].maint_staff_value}</i>
                        </div>`;
    }
    $(".group3_item3 .radio-wrap-group").html('').html(str);
  } else {
    $(".group3_item3 .radio-wrap-group").html('')
  }
}

//组装提交数据
const assembleSubmitData = () => {
  let liftInfoArr = [];
  let liftInfoObj={};
  let flag = 0;
  let data = {
    code: null,
    msg: null
  };
  let submitData;
  $(".content_group2 tbody tr input:checked").each(function (index, ele) {
    let tr = $(this).parent().parent();
    let startTimestamp = Date.parse(new Date(tr.find(`input[id^="start_time"]`).val()));
    let endTimestamp = Date.parse(new Date(tr.find(`input[id^="end_time"]`).val()));
    if (!tr.find(`span[id^="maintenanceSpan"]`).attr("spanAttr")) {
      data.code = 0;
      data.msg = `所勾选第${index + 1}数据维保类型不能为空`;
    }

    if (!tr.find(`input[id^="start_time"]`).val()) {
      data.code = 0;
      data.msg = `所勾选第${index + 1}数据开始时间不能为空`;
    }

    if (!tr.find(`input[id^="end_time"]`).val()) {
      data.code = 0;
      data.msg = `所勾选第${index + 1}数据结束时间不能为空`;
    }

    if (tr.find(`input[id^="start_time"]`).val() && tr.find(`input[id^="end_time"]`).val() && startTimestamp > endTimestamp) {
      data.code = 0;
      data.msg = `所勾选第${index + 1}数据开始时间不能大于结束时间`;
    }
    if(!action){
      liftInfoArr.push(
        {
          lift_id: $(this).attr("lift_id"),
          template_id: tr.find(`span[id^="maintenanceSpan"]`).attr("spanAttr"),
          start_time: tr.find(`input[id^="start_time"]`).val(),
          end_time: tr.find(`input[id^="end_time"]`).val(),
        }
      );
    }else{
      liftInfoObj['plan_id']=$(this).attr("plan_id");
      liftInfoObj['template_id']=tr.find(`span[id^="maintenanceSpan"]`).attr("spanAttr");
      liftInfoObj['start_time']=tr.find(`input[id^="start_time"]`).val();
      liftInfoObj['end_time']=tr.find(`input[id^="end_time"]`).val();
    }
  });

  let maint_comp = $(`#maintenanceCompanySpan`).attr("spanAttr");
  let maint_staff;

  if (!maint_comp) {
    data.code = 0;
    data.msg = `维保公司不能为空`;
  }
  $(`.radio-wrap-item span`).each(function () {
    if ($(this).hasClass("click")) {
      flag = 1;
      maint_staff = $(this).attr("maint_staff");
    }
  });

if (flag === 0) {
  data.code = 0;
  data.msg = `维保员工不能为空`;
}

let newLiftInfoArr = [];
 if (liftInfoArr.length >= 1 && flag === 1) {
    for (let i = 0; i < liftInfoArr.length; i++) {
      let newAbj = liftInfoArr[i];
      newAbj['maint_comp'] = maint_comp;
      newAbj['maint_staff'] = maint_staff;
      newLiftInfoArr.push(newAbj);
    }
  }

  if (liftInfoArr.length===0&& flag === 1) {
    liftInfoObj['maint_comp']=maint_comp;
    liftInfoObj['maint_staff']=maint_staff;
  }

  return submitData = {
    data: data,
    liftInfoArr: newLiftInfoArr,
    liftInfoObj:liftInfoObj
  }
}

// 全选方法
const checkAll = (dom, tableId) => {
  let checkItems = document.getElementById(tableId).getElementsByTagName('input');
  for (let i = 0; i < checkItems.length; i++) {
    let checkItem = checkItems[i];
    checkItem.checked = dom.checked;
  }
}

// 为不能修改的部分添加遮罩
const addCoverInDisabled = (idArr) => {
  $.each(idArr, function (key, value) {
    if (value === 'checkbox') {
      $("input[type='checkbox']").prop("disabled", true).css("cursor", "not-allowed");
    } else {
      if ($(`#${value}`)[0].tagName === 'SPAN') {
        $(`#${value}`).parent().append(`<div class="disabledCover"></div>`).css("cursor", "not-allowed");
      } else if ($(`#${value}`)[0].tagName === 'DIV') {
        $(`#${value}`).append(`<div class="disabledCover"></div>`);
      } else {
        $(`#${value}`).prop("disabled", true).css("cursor", "not-allowed");
      }
    }
  });
}

//页面初始化
const init = () => {
  if (action) {
    $.ajax({
      type: 'get',
      data: {
        plan_id: plan_id
      },
      url: HEADER + 'maintPlan/check_getMaintPlanById.do',
      success: (data) => {
        console.log(data)
        let response = data.data;
        $("#communitySpan").html(response.loation);
        $("#month").val(response.month);

        getMaintStaffsList(function(){
          $(".radio-wrap-group .radio-wrap-item span").each(function () {
            console.log($(this).attr("maint_staff"));
            if($(this).attr("maint_staff")===response.maint_staff){
              $(this).addClass("click");
            }
          });
        });
        constructLifList(response);

        $(`tbody input[type="checkbox"]`).prop("checked",true)
        $("#maintenanceSpan").html(response.template_name).attr("spanAttr",response.template_id);
        $("#start_time").val(response.start_time);
        $("#end_time").val(response.end_time);
        $("#maintenanceCompanySpan").html(response.maint_comp_value).attr("spanAttr",response.maint_comp).attr("title",response.maint_comp_value);

        addCoverInDisabled(["communitySpan","month"]);
        $(".content_title span:last-child").html("修改维保计划");

        //时间选择器(同时绑定多个)
        lay('input[id^="start_time"]').each(function () {
          laydate.render({
            elem: this,
            type: 'datetime',
            format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
            done: function done (value) {
              $("div[id*='layui-laydate']").remove();
              $(this).val(value);
            }
          });
        });
        lay('input[id^="end_time"]').each(function () {
          laydate.render({
            elem: this,
            type: 'datetime',
            format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
            trigger: 'click'
          });
        });

        $('.maintenanceType .select_box span').mousedown(function () {
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

        $('.maintenanceType ul.son_ul li').mousedown(function () {
          let selectText = $(this).closest('.selectText');
          let aSpan = $(this).parents('li').find('span');
          aSpan.html($(this).html() + '<div></div><p></p>').attr('spanAttr', $(this).attr('itemAttr'));
          $(this).parents('li').find('ul').hide();
        });
      }
    }).done(function () {
      if(action==="watch"){
        $(".btn-toolbar").css("display","none");
        $(".content_title span:last-child").html("查看维保计划");
      }
      getMaintenanceCompanyList();
    })
  } else {
    getLocationList();
  }
}

/**
 *初始化
 * */
getmaintTemplate();

setTimeout(init,10);

//时间选择器
laydate.render({
  elem: '#month',
  type: 'month',
  done: function done (value) {
    $('#faultTime').val(value);
    if (value && $("#communitySpan").text() !== "请选择小区") {
      getLifList($("#communitySpan").attr("spanattr"), value);
    }
  }
});

//适配不同分辨率
window.onresize = function () {
  setWrapperWidth();
};

/**
 *事件触发
 * */
//下拉列表公用
$('.select_box').on('click', 'span', function () {
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
  let aSpan = $(this).parents('li').find('span');
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title', $(this).html());
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('sex', $(this).text());
  }
  $(this).parents('li').find('ul').hide();
  if (aSpan.attr('id') === "communitySpan") {
    aSpan.attr("spanAttr", $(this).attr('id'))
  }
  if (aSpan.attr('id') === "maintenanceCompanySpan") {
    aSpan.attr("spanAttr", $(this).attr('itemAttr'))
  }
  if (!aSpan.attr('id') === "maintenanceCompanySpan"&&aSpan.attr('id').indexOf("maintenanceSpan")<0) {
    if ($("#month").val() && $("#communitySpan").text() !== "请选择小区") {
      getLifList($("#communitySpan").attr("spanattr"), $("#month").val());
    }
  }
});

$('.back').click(function () {
  window.location.href = `../html/maintenancePlan.html`
})

//提交表格信息
$(".btn-toolbar button:last-child").click(function () {
  let backInfo = assembleSubmitData().data;
  let liftInfoArr = assembleSubmitData().liftInfoArr;
  let liftInfoObj = assembleSubmitData().liftInfoObj;
  if (backInfo.code === 0) {
    secondPop(backInfo.code, backInfo.msg);
    return false;
  } else {
    if(action){
      $.ajax({
        type: 'post',
        url: HEADER + 'maintPlan/update_MaintPlan.do',
        data: liftInfoObj,
        success: (data) => {
          secondPop(data.code, data.msg);
          if (data.code === 1) {
            setTimeout(function () {
              window.location.href = `../html/maintenancePlan.html`;
            }, 1000);
          }
        }
      })
    }else{
      $.ajax({
        type: 'post',
        url: HEADER + 'maintPlan/add_MaintPlan.do',
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(liftInfoArr),
        success: (data) => {
          secondPop(data.code, data.msg);
          if (data.code === 1) {
            setTimeout(function () {
              window.location.href = `../html/maintenancePlan.html`;
            }, 1000);
          }
        }
      })
    }
  }
})

//单选
$(".radio-wrap-group").on('click', '*', function (e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  else {
    window.event.cancelBubble = true;
  }
  $(".radio-wrap-group span").removeClass("click");

  let dom = e.target;
  let nodeName = e.target.nodeName;
  if (nodeName === "SPAN") {
    $(dom).toggleClass("click");
  }
  if (nodeName === "I") {
    $(dom).prev().toggleClass("click");
  }
})

let temp =  {a:{a1:["A"]},b:{b1:["B"]}};