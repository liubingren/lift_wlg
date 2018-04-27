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
let workOrderId = parseQueryString(window.location.href).orderId;
let action = parseQueryString(window.location.href).action;

// 选择图片
const selectImg = (dom) => {
  $(dom).find("div").toggleClass("hide").toggleClass("show");
}

// 与图片相关的操作方法
const ImgOperation = {
  imgFilesArr: {
    files: []
  },
  // 继续添加图片
  addImg: function () {
    let THIS = this
    let addBtn = document.getElementById('add-img')
    let reader = new FileReader()
    addBtn.onchange = function () {
      let file = addBtn.files[0]
      THIS.imgFilesArr.files.push(file)
      reader.onload = function () {
        let preview = `<div class="imgGroup-item" onclick="selectImg(this)">
                            <img src="${reader.result}"/>
                            <span>${file.name}</span>
                            <div class="item-cover hide">
                                <div class="check_workorderManage"></div>            
                            </div>
                        </div>`
        $(".addImg .imgGroup-wrap").append(preview)
      }
      if (file) {
        reader.readAsDataURL(file)
      }
    }
  }
}

// 加载所有故障分类
const showAuthorityMsg = (datas) => {
  if (datas) {
    getHtml(datas);
    bindIdToCheckbox();
  } else {
    $.ajax({
      type: 'get',
      url: HEADER + 'workMaintain/check_getFaultTree.do',
      success: (data) => {
        getHtml(data.data);
      }
    }).done(function () {
      bindIdToCheckbox();
    })
  }
}

//构造一级目录
const getHtml = (data) => {
  let response = data;
  let html = `<div class="tableHead">
                    <div>一级目录</div><div>二级目录</div><div>三级目录</div><div>故障类别</div><div>选择</div>
                  </div>`;
  let len = response.length;
  for (let i = 0; i < len; i++) {
    let len2 = !response[i].child.length ? 1 : response[i].child.length//要是没有子模块就只添加一行item
    let callbackData = getSubHtml(i, len2, response);
    let treeNumber = 0;
    treeNumber += callbackData.treeNumber;
    //说明没有子模块，只要一个page-name-item,而且左边.modle-name-left的高度只有40px
    let leftHeight = !response[i].child.length ? 40 : treeNumber * 40 + treeNumber - 1;   //没有子模块就只显示一行，高度为40px
    html += `<div class="body-box">
                      <div class="modle-name-left" style="height:${leftHeight}px;line-height:${leftHeight}px">${response[i].name}</div>
                      <div class="page-name-right" id="page-name-content${i}">${callbackData.html}</div>
                  </div>`
  }
  $('#showmsg-body').html(html)
}

//构造二级目录
const getSubHtml = (index, length, data) => {
  let treeNumber = 0;
  let html = ''
  for (let j = 0; j < length; j++) {
    let len1 = !data[index].child.length ? data[index].child.length : data[index].child[j].child.length;
    let isChecked = data[index].child[j].checked;
    let faultType = data[index].child[j].type;
    let response = getGrandsonHtml(index, j, len1, data, faultType, isChecked);
    treeNumber += response.treeNumber;

    let height = !data[index].child[j].child.length ? 40 : response.treeNumberParent * 40 + response.treeNumberParent - 1 //没有子模块就只显示一行，高度为40px
    html += `<div class="page-name-item" id="page-name-item${index}${j}" style="height:${height}px;line-height:${height}px">
                        <div class="page-name-item-title" maint_item_id="${!data[index].child.length ? data[index].maint_item_id : data[index].child[j].maint_item_id}" 
                          style="height:${height}px;line-height:${height}px">${!data[index].child.length ? data[index].name : data[index].child[j].name}</div>
                        <div class="inputSpan" id="inputSpan${index}${j}">${response.html}</div>
                    </div>`
  }
  return {html: html, treeNumber: treeNumber}
}

//构造三级目录
const getGrandsonHtml = (index1, index2, length, data, faultType, isChecked) => {
  let treeNumber = 0;       //记录最小子分支的个数
  let treeNumberParent = 0;
  let html1 = ``
  if (length) {
    for (let n = 0; n < length; n++) {
      let maint_item_id = !data[index1].child.length ? data[index1].child[index2].maint_item_id : data[index1].child[index2].child[n].maint_item_id;
      let checked = !data[index1].child.length ? data[index1].child[index2].checked : data[index1].child[index2].child[n].checked;
      console.log(checked);
      let checkFlag;
      if (checked) {
        checkFlag = 'checked';
      } else {
        checkFlag = '';
      }
      let name = !data[index1].child.length ? data[index1].child[index2].name : data[index1].child[index2].child[n].name;
      let type = !data[index1].child.length ? data[index1].child[index2].type : data[index1].child[index2].child[n].type;
      html1 += `<div><span maint_item_id="${maint_item_id}" class="lv3_name">${name}</span><span class="lv3_type">${type}</span><span class="lv3_checkbox"><input type="checkbox" ${checkFlag} name="faultName"/></span></div>`
    }
    treeNumber += length;
    treeNumberParent += length;
  } else {
    let checkFlag;
    if (isChecked) {
      checkFlag = 'checked';
    } else {
      checkFlag = '';
    }
    html1 += `<div><span class="lv3_name"></span><span class="lv3_type">${faultType}</span><span class="lv3_checkbox"><input type="checkbox" ${checkFlag} name="faultName"/></span></div>`;
    treeNumber += 1;
  }
  return {html: html1, treeNumber: treeNumber, treeNumberParent: treeNumberParent}
}

//获取小区列表
const getLocationList = () => {
  $.ajax({
    type: 'get',
    url: HEADER + 'workMaintain/check_listLocation.do',
    success: (data) => {
      constructLocationList(data.data)
    }
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

//获取电梯列表
const getLifList = (id) => {
  $.ajax({
    type: 'get',
    url: HEADER + 'workMaintain/check_listLiftByLid.do',
    data: {
      lid: id
    },
    success: (data) => {
      constructLifList(data.data)
    }
  })
}

// 构造电梯列表
const constructLifList = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li maint_comp="${data[i].maint_comp}" id_nr="${data[i].id_nr}" id="${data[i].id}">${data[i].unit_id}</li>`;
    }
    $(".liftList .son_ul").html('').html(str);
  } else {
    $(".liftList .son_ul").html('')
  }
}

//获取解决方法列表
const getSolutionList = () => {
  $.ajax({
    type: 'get',
    url: HEADER + 'workOrder/check_listSolution.do',
    success: (data) => {
      constructSolutionList(data.data)
    }
  })
}

// 构造解决方法列表
const constructSolutionList = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li>${data[i]}</li>`;
    }
    $(".solutionList .son_ul").html('').html(str);
  } else {
    $(".solutionList .son_ul").html('')
  }
}

//获取维保人员列表
const getMaintStaffsList = () => {
  $.ajax({
    type: 'get',
    url: HEADER + 'workOrder/check_listMaintStaffs.do',
    success: (data) => {
      constructMaintStaffsList(data.data)
    }
  })
}

// 构造维保人员列表
const constructMaintStaffsList = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li itemAttr="${data[i].maint_staff}">${data[i].maint_staff_value}</li>`;
    }
    $(".maintStaffsList .son_ul").html('').html(str);
  } else {
    $(".maintStaffsList .son_ul").html('')
  }
}

// 构建图片列表
const constructImgList = (data) => {
  let str = ``;
  if (data.indexOf(',') > -1) {
    let datas = data.split(',');
    console.log(datas);
    for (let i = 0; i < datas.length; i++) {
      let imgSrc = HEADER + 'workFaul/check_getFile.do?fileUrl=' + datas[i];
      let imgName = datas[i].split('iamsplitchar')[1];
      console.log(imgSrc)
      str += `
        <div class="imgGroup-item" onclick="selectImg(this)">
                            <img src="${imgSrc}"/>
                            <span>${imgName}</span>
                            <div class="item-cover hide" imgSrc="${datas[i]}">
                                <div class="check_workorderManage"></div>            
                            </div>
                        </div>
    `
    }
    $(".imgList .imgGroup-wrap").html(str);
  } else {
    let imgSrc = HEADER + 'workFaul/check_getFile.do?fileUrl=' + data;
    let imgName = data.split('iamsplitchar')[1];
    console.log(imgSrc)
    str += `
        <div class="imgGroup-item" onclick="selectImg(this)">
                            <img src="${imgSrc}"/>
                            <span>${imgName}</span>
                            <div class="item-cover hide" imgSrc="${data}">
                                <div class="check_workorderManage"></div>            
                            </div>
                        </div>
    `
    $(".imgList .imgGroup-wrap").html(str);
  }
}

// 绑定故障类别id到长列表的checkbox上
const bindIdToCheckbox = () => {
  $("#showmsg-body .body-box input[type='checkbox']").each(function () {
    let checkboxId;
    let grandfather = $(this).parent().parent();
    if (grandfather.find('.lv3_name').attr("maint_item_id")) {
      checkboxId = grandfather.find('.lv3_name').attr("maint_item_id");
    } else {
      checkboxId = grandfather.parent().prev().attr("maint_item_id");
    }
    $(this).attr("id", checkboxId);
  })
}

//获取选择的checkbox的id
const getCheckedCheckboxId = () => {
  let ids = [];
  $("#showmsg-body .body-box input[type='checkbox']:checked").each(function () {
    ids.push($(this).attr("id"))
  })
  let idstr = ids.join(",");
  return idstr;
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
//初始化查看页面
const watchInit=(response)=>{
  addCoverInDisabled(['communitySpan', 'faultTime','fault_type_input', 'solutionSpan', 'solution_input', 'remark', 'other', 'stateSpan', 'maintStaffsSpan', 'checkbox','checkSpan','checkText']);
  $(".btn-toolbar button").attr("data-id",response.lift_id).click(function(){
    if(action==="watchfromlift"){
      confirmAlarm(this);
    }else{
      window.location.href = `../html/workorderManage.html?orderType=workfaul`
    }
  });
  let str = `.group5_item3 .inCheckList,.group5_item3 .checkList,.group5_item4 div,.group5_item4 textarea`;
  $(`${str}`).css("display", "block");
  $(`.group5_item4`).css("height", "70px");
  let check_status_text_wacth;
  switch (response.check_status) {
    case 1:
      check_status_text_wacth = `未审核`;
      break;
    case 2:
      check_status_text_wacth = `审核未通过`;
      break;
    case 3:
      check_status_text_wacth = `已审核`;
      break;
  }
  $("#checkSpan").attr('spanAttr',response.check_status).html(check_status_text_wacth);
  $("#checkText").val(response.check_opinions);
  $(".titleRight").css("display","none");
  $("#delete").css("visibility", "hidden");
}

//页面初始化
const init = () => {
  if (workOrderId) {
    $.ajax({
      type: 'get',
      data: {
        id: workOrderId
      },
      url: HEADER + 'workFaul/check_getWorkFaulById.do',
      success: (data) => {
        let response = data.data;
        console.log(data)
        // 一顿操作绑定数据
        $("#communitySpan").html(response.user);
        $(".content_group4 tbody td:nth-child(1)").html(response.id_nr);
        $(".content_group4 tbody td:nth-child(2)").html(response.unit_id);
        $(".content_group4 tbody td:nth-child(3)").html(response.inst_addr);
        $("#maint_comp").val(response.maint_comp);
        $("#fault_type_input").val(response.fault_type);
        $("#faultTime").val(response.fault_time);
        $("#remark").val(response.remark);
        $("#solutionSpan").attr("spanAttr", response.solution).html(response.solution||"请选择解决方法或者输入解决方法");
        $("#other").val(response.other_fault);
        let order_status_value;
        switch (response.order_status) {
          case 1:
            order_status_value = '未处理';
            break;
          case 2:
            order_status_value = '处理中';
            break;
          case 3:
            order_status_value = '已处理';
            break;
        }

        $("#stateSpan").attr("spanAttr", response.order_status).html(order_status_value);
        $("#maintStaffsSpan").attr("spanAttr", response.maint_staff).html(response.maint_staff_value||"请选择维保人员");

        showAuthorityMsg(data.data.faultClassList);  // 加载所有权限信息

        if (response.file_url) {
          constructImgList(response.file_url);
        } else {
          $(".imgList .imgGroup-wrap").html('');  //清空新增图片列表
        }

        let title;
        let str = '';
        switch (action) {
          case "watch":
            watchInit(response);
            title = `查看`;
            break;
          case "watchfromlift":
            $(".back").attr("data-id",response.lift_id);
            watchInit(response);
            title = `查看`;
            break;
          case "edit":
            title = `修改`;
            addCoverInDisabled(['communitySpan', 'faultTime']);
            break;
          case "check":
            title = `审核`;
            addCoverInDisabled(['communitySpan', 'faultTime', 'fault_type_input', 'solutionSpan', 'solution_input', 'remark','other', 'stateSpan', 'maintStaffsSpan', 'checkbox']);
            let htmlStr = `.group5_item3 .inCheckList,.group5_item3 .checkList,.group5_item4 div,.group5_item4 textarea`;
            $(`${htmlStr}`).css("display", "block");
            $(`.group5_item4`).css("height", "70px");
            let check_status_text;
            switch (response.check_status) {
              case 1:
                check_status_text = `未审核`;
                break;
              case 2:
                check_status_text = `审核未通过`;
                break;
              case 3:
                check_status_text = `已审核`;
                break;
            }
            $("#checkSpan").attr('spanAttr',response.check_status).html(check_status_text);
            $("#checkText").val(response.check_opinions);
            $(".titleRight").css("display","none");
            $("#delete").css("visibility", "hidden");
            break;
          default:
            title = `新增`;
        }
        str += `${title}系统故障工单`;
        $(".content_title span:last-child").html(str);
      }
    })
  } else {                    //新增页面
    showAuthorityMsg();// 加载所有权限信息
  }
  getLocationList();
  getMaintStaffsList();
  getSolutionList();
}

/**
 *初始化
 * */

// showAuthorityMsg();// 加载所有权限信息
// getLocationList();
// getSolutionList();
// getMaintStaffsList();

init();

//时间选择器
laydate.render({
  elem: '#faultTime',
  type: 'datetime',
  format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
  done: function done (value) {
    $('#faultTime').val(value);
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
    getLifList($(this).attr('id'));
  }
  if (aSpan.attr('id') === "nr_idSpan") {
    $("#id_nr_input").val($(this).attr('id_nr'));
    $("#maint_comp").val($(this).attr('maint_comp'));
    aSpan.attr("spanAttr", $(this).attr('id'))
  }
  if (aSpan.attr('id') === "typeSpan") {
    aSpan.attr("spanAttr", $(this).attr('itemAttr'))
  }
  if (aSpan.attr('id') === "solutionSpan") {
    aSpan.attr("spanAttr", $(this).html())
  }
  if (aSpan.attr('id') === "maintStaffsSpan") {
    aSpan.attr("spanAttr", $(this).attr('itemAttr'))
  }
  if (aSpan.attr('id') === "stateSpan") {
    aSpan.attr("spanAttr", $(this).attr('itemAttr'))
  }
  if (aSpan.attr('id') === "checkSpan") {
    aSpan.attr("spanAttr", $(this).attr('itemAttr'))
  }
});

$('.back').click(function () {
  if(action==="watchfromlift"){
    confirmAlarm(this);
  }else{
    window.location.href = `../html/workorderManage.html?orderType=workfaul`
  }
})

$("#content .content_group1 .right").click(function () {
  $("#picture-pop").css({
    'display': 'block',
  })
  $("#content").css("visibility", "hidden")
  if ($('.imgList').hasClass('hide')) {
    $('.imgList').removeClass('hide').addClass('show');
    $('.addImg').removeClass('show').addClass('hide');
    $(".titleLeft i").addClass('imgCheck-workorderManage').removeClass('imgUncheck_workorderManage');
    $(".titleLeft span").addClass('check').removeClass('uncheck');
    $(".titleRight i").addClass('addImgUnclick_workorderManage').removeClass('addImgClick_workorderManage');
    $(".titleRight span").removeClass('check').addClass('uncheck');
  }
  // document.getElementById('cover').classList.add('cover');
})

//图片列表弹出框选项卡
$(".titleLeft").click(function () {
  if ($(this).find('i').hasClass('imgCheck-workorderManage')) {
    return false
  } else {
    $(this).find('i').toggleClass('imgCheck-workorderManage').toggleClass('imgUncheck_workorderManage');
    $(this).find('span').toggleClass('check').toggleClass('uncheck');
    $(".titleRight i").toggleClass('addImgUnclick_workorderManage').toggleClass('addImgClick_workorderManage');
    $(".titleRight span").toggleClass('check').toggleClass('uncheck');
    $('.imgList').toggleClass('show').toggleClass('hide');
    $('.addImg').toggleClass('show').toggleClass('hide');
  }
})

$(".titleRight").click(function () {
  if ($(this).find('i').hasClass('addImgClick_workorderManage')) {
    return false
  } else {
    $(this).find('i').toggleClass('addImgUnclick_workorderManage').toggleClass('addImgClick_workorderManage');
    $(this).find('span').toggleClass('check').toggleClass('uncheck');
    $(".titleLeft i").toggleClass('imgCheck-workorderManage').toggleClass('imgUncheck_workorderManage');
    $(".titleLeft span").toggleClass('check').toggleClass('uncheck');
    $('.imgList').toggleClass('show').toggleClass('hide');
    $('.addImg').toggleClass('show').toggleClass('hide');
  }
})

//提交表格信息
$(".btn-toolbar button:last-child").click(function () {
  if (action === "check") {
    let id = workOrderId;
    let check_status = $("#checkSpan").attr("spanAttr");
    let check_opinions = $("#checkText").val();

    $.ajax({
      type: 'post',
      url: HEADER + 'workFaul/approval_WorkFaul.do',
      data: {
        id: id,
        check_status: check_status,
        check_opinions: check_opinions
      },
      success: (data) => {
        // init();
        secondPop(data.code, data.msg);
        if (data.code === 1) {
          setTimeout(function () {
            window.location.href = `../html/workorderManage.html?orderType=workfaul`;
          }, 1000);
        }
      }
    })
  } else if(action === "edit"){
    let remark = $("#remark").val();          //备注
    let solution = $("#solution_input").val() !== '' ? $("#solution_input").val() : $("#solutionSpan").attr("spanAttr");        //解决方法
    let other_fault = $("#other").val();      //其它故障
    let order_status = $("#stateSpan").attr("spanAttr");    //正型，工单状态
    let maint_staff = $("#maintStaffsSpan").attr("spanAttr");     //32位,维保人员
    let imgList = ImgOperation.imgFilesArr.files;            //文件数组
    let maint_item_ids = getCheckedCheckboxId();  //故障分类id,逗号分隔
    let url;

    let jsonData = new FormData();
    let namesInput = $('.addImg .imgGroup-wrap span');
    for (let i = 0; i < imgList.length; i++) {
      console.log(namesInput[i].innerHTML);
      jsonData.append('file', imgList[i]);
      jsonData.append('newFileName', namesInput[i].innerHTML);
    }

    jsonData.append('remark', remark)
    jsonData.append('solution', solution);
    jsonData.append('other_fault', other_fault)
    jsonData.append('order_status', order_status);
    jsonData.append('maint_staff', maint_staff)
    jsonData.append('maint_item_ids', maint_item_ids)

    if (action === 'edit') {
      jsonData.append('id', workOrderId);
      url = "workFaul/update_WorkFaul.do";
    }

    $.ajax({
      type: 'post',
      contentType: false,
      processData: false,
      url: HEADER + url,
      data: jsonData,
      beforeSend: () => {
        loading()
      },
      success: (data) => {
        document.getElementById('loading').style.display = 'none';
        // $(".addImg .imgGroup-wrap").html('');  //清空新增图片列表
        // ImgOperation.imgFilesArr.files = [];
        // init();
        secondPop(data.code, data.msg);
        if (data.code === 1) {
          setTimeout(function () {
            window.location.href = `../html/workorderManage.html?orderType=workfaul`;
          }, 1000);
        }
      }
    })
  }else{
    if(action==="watchfromlift"){
      window.location.href = `../html/lifts_manage.html`
    }else{
      window.location.href = `../html/workorderManage.html?orderType=workfaul`
    }
  }

})

//删除图片列表中的图片
$(".imgList .delete").click(function () {
  let srcArr = [];
  let srcStr
  let imgSrc = $(".imgList .item-cover.show");
  imgSrc.each(function () {
    srcArr.push($(this).attr('imgSrc'));
  })
  if (srcArr.length !== 0) {
    if (srcArr.length >= 2) {
      srcStr = srcArr.join(',');
    } else {
      srcStr = srcArr.join('');
    }
    $.ajax({
      type: 'post',
      data: {
        fileurl: srcStr,
        id: workOrderId
      },
      url: HEADER + 'workFaul/delete_File.do',
      beforeSend: () => {
        loading()
      },
      success: (data) => {
        document.getElementById('loading').style.display = 'none'
        imgSrc.each(function () {
          $(this).parent().html('').remove();
        })
        secondPop(data.code, data.msg);
        init();
      }
    })
  }
})

//删除新增图片列表中的图片
$(".addImg .btn-group button:first-child").click(function () {
  let checkedImg = $(".addImg .item-cover");
  checkedImg.each(function (index, ele) {
    if ($(this).hasClass("show")) {
      ImgOperation.imgFilesArr.files.splice(index, 1);
      $(ele).parent().remove()
    }
  })
})

ImgOperation.addImg();