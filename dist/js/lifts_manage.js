'use strict';

// 设置.lifts-list的宽度
var setLiftsListWidth = function setLiftsListWidth() {
  var liftsList = document.getElementById('lifts-list');
  if (liftsList) {
    liftsList.style.width = document.getElementById('content').clientWidth - 310 + 'px';
  }
};

// 获取电梯列表数组
var getLiftsData = function getLiftsData() {
  var lid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'd87cfe59cb9b4260ac0e1c909e6350bf';
  var pagesize = arguments[1];
  var product_id = arguments[2];
  var id_nr = arguments[3];
  var lname = arguments[4];
  var page = arguments[5];

  loading();

  axios({
    url: HEADER + '/lift/check_getLiftByLidForPage.do',
    params: {
      lid: lid,
      page: page,
      pagesize: pagesize,
      product_id: product_id,
      id_nr: id_nr,
      lname: lname
    }
  }).then(function (response) {
    disLoading();
    liftsMangeVM.liftsArr = response.data.data.list;
    Page.loadTotalPage(response.data.data);
  });
};

// 树状图
// @lid: 区域ID
var loadZtree = function loadZtree(lid) {
  var lname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '全国';
  var treeNode = arguments[2];
  var expandFlag = arguments[3];

  var zTreeObj = void 0;
  var zTree = void 0;
  var setting = {
    view: {
      showTitle: false,
      showLine: false,
      showIcon: false
    },
    data: {
      simpleData: {
        enable: true
      }
    },
    callback: {
      onClick: function onClick(event, treeId, treeNode) {
        // 禁止a标签跳转
        $('#treeDom').find('a').removeAttr('href');

        // 点击变色
        $('#' + treeNode.tId).find('.node_name').eq(0).css({
          'color': '#2e59bd'
        });

        // 获取当前区域层级
        liftsMangeVM.areaLevel = treeNode.type;

        // 获取对应的资源
        var lid = treeNode.id; // 获取点击模块的ID
        var name = treeNode.name;
        liftsMangeVM.parentAreaName = name;
        liftsMangeVM.popData.communityId = lid;
        getLiftsData(lid);

        if (liftsMangeVM.areaLevel === 4) {
          sessionStorage.setItem('lid', lid);
        }

        toggleInterval(treeNode.type);
      }
    }
  };

  if (lid) {
    getLiftsData(lid);
  }

  // 加载左侧资源树
  $.ajax({
    type: 'get',
    url: HEADER + '/location/check_getAllLocationByUser.do',
    success: function success(data) {
      var treeData = data.data;

      zTreeObj = $.fn.zTree.init($('#treeDom'), setting, treeData);
      zTree = $.fn.zTree.getZTreeObj("treeDom");

      // 自动展开全国
      var rootNode = zTree.getNodeByParam('name', '全国');
      zTree.expandNode(rootNode, true);

      // 定位到指定的节点
      var currentNode = zTree.getNodeByParam('name', lname);
      zTree.expandNode(currentNode, true);
      // 定位变色
      $('#' + currentNode.tId).find('.node_name').eq(0).css({
        'color': '#2e59bd'
      });
    }
  });
};

// 设置和清除定时器
var TIMER = void 0;
// 根据层级确定设置或者删除定时器
var toggleInterval = function toggleInterval(areaLevel) {
  if (areaLevel === 4) {
    var lid = sessionStorage.getItem('lid');
    TIMER = setInterval(function () {
      liftsMangeVM.reloadPerFive(lid);
    }, 5000);
  } else {
    clearInterval(TIMER);
  }
};

/*上面是函数定义区, 下面是代码执行区**********************************************/

setLiftsListWidth();
window.onresize = function () {
  setWrapperWidth();
  setLiftsListWidth();
};

var liftsMangeVM = new Vue({
  el: '#lifts-manage',
  data: {
    ok: true,
    parentAreaName: '',
    searchAreaName: '',
    liftsCount: '',
    liftsArr: [], // 后台获取的电梯列表数组
    inputAreaName: '',
    areaLevel: 0,
    selectedLabel: false,

    whichContent: 'liftsList', // 显示列表页/详情页/表格页
    whichTable: '', //显示哪个表格

    // 新增/编辑电梯弹窗变量
    popData: {
      isAddBtn: 1, // 判断是新增还是修改
      // 左列
      liftOutCode: '',
      liftRegisterCode: '',
      liftKind: '',
      liftVersion: '',
      installAddr: '',
      particularAddr: '',
      longitude: '',
      latitude: '',
      liftInsideCode: '',
      liftManufacturer: '',
      importAgent: '',
      outDate: '',
      transformUnit: '',
      // 右列
      transformDate: '',
      installUnit: '',
      installDate: '',
      maintainUnit: '',
      maintainUnitName: '',
      maintainPersonArr: [],
      maintainPersonIds: [],
      rescuePhone: '',
      communityUnit: '',
      liftFloor: '',
      ratedSpeed: '',
      ratedWeight: '',
      showingFloor: '',
      nextYearCheckDate: '',
      annualCheck: {},
      // 其他
      communityId: '', // 小区ID
      liftId: '' // 电梯ID
    },

    // 详情页数据
    liftDetail: {
      id_nr: '',
      unit_id: '',
      date_dev: '',
      service_mode: '',
      car_status: '',
      car_direction: '',
      door_zone: '',
      car_position: '',
      door_status: '',
      passenger_status: '',

      // 收缩标题点击次数
      isClickTwice: false,

      // 电梯基础信息
      product_id: '',
      inst_type: '',
      product_name: '',
      inst_addr: '',
      longitude: '',
      latitude: '',
      vendor: '',
      import_dealer: '',
      production_date: '',
      mod_company: '',
      mod_date: '',
      inst_date: '',
      inst_comp: '',
      maint_comp: '',
      maint_staffs: '',
      emergency_tel: '',
      user: '',
      lift_floor_nr: '',
      lift_rated_speed: '',
      lift_rated_load: '',
      display_floor: '',
      next_annual_inspection_date: '',

      // 统计信息
      total_running_time: '',
      present_counter_value: '',
      // 用电信息
      w: '',
      voltage_a: '',
      voltage_b: '',
      voltage_c: '',
      electric_current_a: '',
      electric_current_b: '',
      electric_current_c: '',
      temperature_a: '',
      temperature_b: '',
      temperature_c: '',
      temperature_d: '',
      // 机房信息
      temperature_room: ''
    },

    // 详情页故障日志表格数据
    breakdownLog: [],
    eventLogs: [],
    alarmBtnStatusLogs: [],
    logTitle: '', // 表格详情页标题

    checkInput: {
      showingType: false,
      floorType: false
    },
    // 新增电梯弹窗下拉
    addLiftSelect: {
      liftKindArr: [],
      maintainUnitArr: [],
      maintainPersonArr: [],
      maintainPersonIds: [],
      usingCommunityArr: [],
      showKindSelect: false,
      showMaintainUnit: false,
      showCommunityUnit: false,
      showMaintainPerson: false
    }
  },
  computed: {
    // 当电梯列表个数大于等于五时才用百分比长度
    isShrink: function isShrink() {
      return this.liftsArr.length >= 5;
    },
    areaLevelBool: function areaLevelBool() {
      return this.areaLevel < 4;
    },
    isRising: function isRising() {
      if (this.liftsArr.car_direction === 1) {
        return 1;
      } else {
        return 0;
      }
    },
    isCheckedArr: function isCheckedArr() {
      return Array(this.addLiftSelect.maintainPersonArr.length).fill(false);
    }
  },
  methods: {
    fn: function fn(evnt) {
      var e = window.event || evnt;
      e.stopPropagation();
      e.stopPropagation();
      console.log(e.target);
    },

    // 点击区域图标进入下一级区域列表
    clickInto: function clickInto(level, lid, lname) {
      this.parentAreaName = lname;
      this.areaLevel++;
      this.popData.communityId = lid;
      if (level === '3') {
        this.areaLevel = 4;
        getLiftsData(lid);
        // 将小区id和名称缓存在 sessionStorage 里
        // 从其他页面返回的时候加载原来的列表层级
        sessionStorage.setItem('lid', lid);
      } else if (level === '2') {
        loadZtree(lid, lname);
        sessionStorage.setItem('lname', lname);
      } else {
        loadZtree(lid, lname);
      }

      toggleInterval(this.areaLevel);
    },

    // 进入电梯列表后每个五秒刷新一次列表的函数
    reloadPerFive: function reloadPerFive(lid) {
      axios({
        url: HEADER + '/lift/check_getLiftByLidForPage.do',
        params: {
          lid: lid
        }
      }).then(function (response) {
        liftsMangeVM.liftsArr = response.data.data.list;
        Page.loadTotalPage(response.data.data);
      });
      // 清除选中样式和ID
      var liftLabels = document.querySelectorAll('.lift-label');
      for (var i = 0; i < liftLabels.length; i++) {
        liftLabels[i].classList.remove('checked-label');
      }
      this.popData.liftId = '';
    },
    selectLift: function selectLift(liftId, event) {
      this.popData.liftId = liftId;
      var liftLabels = document.querySelectorAll('.lift-label');
      for (var i = 0; i < liftLabels.length; i++) {
        liftLabels[i].classList.remove('checked-label');
      }
      event.target.classList.add('checked-label');
    },


    // 提交新增或修改的电梯
    submitAddLift: function submitAddLift() {
      var THIS = this;
      var url = '';
      // 判断新增还是更新
      if (this.popData.isAddBtn) {
        url = HEADER + '/lift/add_addLift.do';
      } else {
        url = HEADER + '/lift/update_updateLift.do';
      }
      axios({
        method: 'post',
        url: url,
        params: {
          id: this.popData.liftId,
          lid: this.popData.communityId,
          product_id: this.popData.liftOutCode,
          id_nr: this.popData.liftRegisterCode,
          inst_type: this.popData.liftKind,
          product_name: this.popData.liftVersion,
          inst_addr: this.popData.installAddr,
          unit_id: this.popData.liftInsideCode,
          vendor: this.popData.liftManufacturer,
          import_dealer: this.popData.importAgent,
          production_date: this.popData.outDate,
          mod_company: this.popData.transformUnit,
          mod_date: this.popData.transformDate,
          inst_comp: this.popData.installUnit,
          inst_date: this.popData.installDate,
          maint_comp: this.popData.maintainUnit,
          emergency_tel: this.popData.rescuePhone,
          user: this.popData.communityUnit,
          lift_floor_nr: this.popData.liftFloor,
          lift_rated_speed: this.popData.ratedSpeed,
          lift_rated_load: this.popData.ratedWeight,
          maint_staffs: this.addLiftSelect.maintainPersonIds.join(),
          longitude: this.popData.longitude,
          latitude: this.popData.latitude,
          display_floor: this.popData.showingFloor,
          next_annual_inspection_date: this.popData.nextYearCheckDate,
          next_annual_inspection_fileurl: this.popData.annualCheck
        }
      }).then(function (response) {
        var responseData = response.data;
        secondPop(responseData.code, responseData.msg);
        if (responseData.code === 1) {
          getLiftsData(THIS.popData.communityId);
        }
      });
    },

    // 检测输入类型并显示错误提示
    isShowingInt: function isShowingInt(inputValue) {
      return this.checkInput.showingType = !/^[0-9]*[1-9][0-9]*$/.test(inputValue);
    },
    isFloorInt: function isFloorInt(inputValue) {
      return this.checkInput.floorType = !/^[0-9]*[1-9][0-9]*$/.test(inputValue);
    },

    // 弹窗下拉列表相关
    showLiftKindList: function showLiftKindList() {
      this.addLiftSelect.showKindSelect = !this.addLiftSelect.showKindSelect;
    },
    selectLiftKindLi: function selectLiftKindLi(item) {
      this.addLiftSelect.showKindSelect = false;
      this.popData.liftKind = item;
    },
    selectMaintainUnit: function selectMaintainUnit(item) {
      this.addLiftSelect.showMaintainUnit = false;
      this.popData.maintainUnit = item.id;
      this.popData.maintainUnitName = item.name;
    },
    selectCommunityUnit: function selectCommunityUnit(item) {
      this.addLiftSelect.showCommunityUnit = false;
      this.popData.communityUnit = item;
    },
    // 维保人员
    selectMaintainPerson: function selectMaintainPerson(name, index, id) {
      this.addLiftSelect.showMaintainPerson = false;
      this.isCheckedArr[index] = !this.isCheckedArr[index];

      if (this.isCheckedArr[index]) {
        this.popData.maintainPersonArr.push(name);
        this.addLiftSelect.maintainPersonIds.push(id);
      } else {
        this.popData.maintainPersonArr = this.popData.maintainPersonArr.splice(index, 1);
        this.addLiftSelect.maintainPersonIds = this.addLiftSelect.maintainPersonIds.splice(index, 1);
      }
    },

    // 打开新增电梯窗口
    openAddLift: function openAddLift() {
      openPop('add-update-lift');
      this.popData.isAddBtn = true;
      $('#lifts-list').find('input').val('');
    },


    // 打开修改电梯窗口
    openEditLift: function openEditLift() {
      if (!this.popData.liftId) {
        secondPop(0, '请先选择电梯');
      } else {
        openPop('add-update-lift');
        this.popData.isAddBtn = false;
        axios({
          url: HEADER + '/lift/check_getLiftByLiftId.do',
          params: {
            id: this.popData.liftId
          }
        }).then(function (_ref) {
          var data = _ref.data;

          var liftData = data.data;
          // 左列
          {
            liftsMangeVM.popData.liftOutCode = liftData.product_id;
            liftsMangeVM.popData.liftRegisterCode = liftData.id_nr;
            liftsMangeVM.popData.liftKind = liftData.inst_type;
            liftsMangeVM.popData.liftVersion = liftData.product_name;
            liftsMangeVM.popData.installAddr = liftData.inst_addr;
            liftsMangeVM.popData.longitude = liftData.longitude;
            liftsMangeVM.popData.latitude = liftData.latitude;
            liftsMangeVM.popData.liftInsideCode = liftData.unit_id;
            liftsMangeVM.popData.liftManufacturer = liftData.vendor;
            liftsMangeVM.popData.importAgent = liftData.import_dealer;
            liftsMangeVM.popData.outDate = liftData.production_date;
            liftsMangeVM.popData.transformUnit = liftData.mod_company;
          }
          // 右列
          {
            liftsMangeVM.popData.transformDate = liftData.mod_date;
            liftsMangeVM.popData.installUnit = liftData.inst_comp;
            liftsMangeVM.popData.installDate = liftData.inst_date;
            liftsMangeVM.popData.maintainUnit = liftData.maint_comp;
            liftsMangeVM.popData.maintainPersonArr = liftData.maint_staffs.split(',');
            liftsMangeVM.popData.rescuePhone = liftData.emergency_tel;
            liftsMangeVM.popData.communityUnit = liftData.user;
            liftsMangeVM.popData.liftFloor = liftData.car_position;
            liftsMangeVM.popData.ratedSpeed = liftData.lift_rated_speed;
            liftsMangeVM.popData.ratedWeight = liftData.lift_rated_load;
            liftsMangeVM.popData.showingFloor = liftData.display_floor;
            liftsMangeVM.popData.nextYearCheckDate = liftData.next_annual_inspection_date;
            liftsMangeVM.popData.liftId = liftData.id;
          }
          if (liftData.maint_staffs) {
            var staffs = liftData.maint_staffs.split(',');
            for (var i = 0; i < staffs.length; i++) {
              for (var j = 0; j < liftsMangeVM.addLiftSelect.maintainPersonArr.length; j++) {
                if (staffs[i] === liftsMangeVM.addLiftSelect.maintainPersonArr[j].name) {
                  liftsMangeVM.addLiftSelect.maintainPersonIds.push(liftsMangeVM.addLiftSelect.maintainPersonArr[j].id);
                }
              }
            }
          }
          if (liftData.maint_comp) {
            var maintComps = liftData.maint_comp.split(',');
            for (var _i = 0; _i < maintComps.length; _i++) {
              for (var _j = 0; _j < liftsMangeVM.addLiftSelect.maintainUnitArr.length; _j++) {
                if (maintComps[_i] === liftsMangeVM.addLiftSelect.maintainUnitArr[_j].name) {
                  liftsMangeVM.popData.maintainUnit.split(',').push(liftsMangeVM.addLiftSelect.maintainUnitArr[_j].id);
                }
              }
            }
            console.log(liftsMangeVM.popData.maintainUnit);
          }
        });
      }
    },

    // 打开删除电梯窗口
    openDelete: function (_openDelete) {
      function openDelete() {
        return _openDelete.apply(this, arguments);
      }

      openDelete.toString = function () {
        return _openDelete.toString();
      };

      return openDelete;
    }(function () {
      if (!this.popData.liftId) {
        secondPop(0, '请先选择电梯');
      } else {
        openDelete('确认删除该设备？');
      }
    }),

    // 确认删除电梯
    confirmDeleteLift: function confirmDeleteLift() {
      var THIS = this;
      axios({
        method: 'post',
        url: HEADER + '/lift/delete_deleteLift.do',
        params: {
          id: this.popData.liftId
        }
      }).then(function (_ref2) {
        var data = _ref2.data;

        secondPop(data.code, data.msg);
        if (data.code === 1) {
          getLiftsData(THIS.popData.communityId);
        }
      });
    },

    // 输入地名查询电梯列表
    searchLiftsList: function searchLiftsList() {
      var _this = this;

      var THIS = this;
      axios({
        url: HEADER + '/location/check_sreachLocationByName.do',
        params: {
          name: THIS.inputAreaName
        }
      }).then(function (_ref3) {
        var data = _ref3.data;

        var dataArr = data.data;
        var lid = dataArr[0].id;
        getLiftsData(lid);
        _this.areaLevel = dataArr[0].type;
        // 在树列表上定位到相应位置
        loadZtree(lid, THIS.inputAreaName);
      });
    },

    // 打开详情页
    intoDetail: function intoDetail(id) {
      clearInterval(TIMER);
      this.liftId = id;
      this.whichContent = 'liftDetail';
      var THIS = this;
      axios({
        url: HEADER + '/lift/check_getLiftByLiftId.do',
        params: {
          id: id
        }
      }).then(function (_ref4) {
        var data = _ref4.data;

        var detailData = data.data;
        var acceptObj = THIS.liftDetail;

        for (var acceptItem in detailData) {
          for (var detailItem in acceptObj) {
            if (detailItem === acceptItem) {
              acceptObj[acceptItem] = detailData[detailItem];
            }
          }
        }
      });
      // 加载故障日志
      this.getBreakdownLog(this.liftId, 3);
      this.getEventLog(this.liftId, 3);
      this.getAlarmBtnLog(this.liftId, 3);
    },


    // 获取故障日志
    getBreakdownLog: function getBreakdownLog(id, pageSize, page) {
      var THIS = this;
      axios({
        url: HEADER + '/liftFault/check_getLiftFaultByLiftInfo.do',
        params: {
          lift_id: id,
          pagesize: pageSize,
          page: page
        }
      }).then(function (_ref5) {
        var data = _ref5.data;

        THIS.breakdownLog = data.data.list;
      });
    },

    // 获取事件日志
    getEventLog: function getEventLog(id, pageSize, page) {
      var THIS = this;
      axios({
        url: HEADER + '/liftEvent/check_getLiftEventByLiftInfoForPage.do',
        params: {
          lift_id: id,
          pagesize: pageSize,
          page: page
        }
      }).then(function (_ref6) {
        var data = _ref6.data;

        THIS.eventLogs = data.data.list;
      });
    },

    // 获取报警按钮状态
    getAlarmBtnLog: function getAlarmBtnLog(id, pageSize, page) {
      var THIS = this;
      axios({
        url: HEADER + '/liftAlarm/check_getLiftAlarmByLiftInfo.do',
        params: {
          lift_id: id,
          pagesize: pageSize,
          page: page
        }
      }).then(function (_ref7) {
        var data = _ref7.data;

        THIS.alarmBtnStatusLogs = data.data.list;
      });
    },


    // 故障工单查看工单链接
    breakdownWorkOrder: function breakdownWorkOrder(id) {
      return 'systemError_workorderManage.html?orderId=' + id + '&action=watchfromlift';
    },


    // 报警按钮查看工单链接
    alarmWorkOrder: function alarmWorkOrder(id) {
      return 'examine_workorderalarm.html?orderId=' + id + '&action=watchfromdetailed';
    },


    // 详情返回列表页或其他页面
    goBack: function goBack() {
      if (sessionStorage.getItem('alarmLiftId')) {
        window.history.back();
      } else {
        this.whichContent = 'liftsList';
        loadZtree();

        var lname = sessionStorage.getItem('lname');
        var lid = sessionStorage.getItem('lid');

        // 让层级为4(小区级)
        this.areaLevel = 4;

        getLiftsData(lid);

        setTimeout(function () {
          setLiftsListWidth();
        }, 1);
        setTimeout(function () {
          loadZtree(lid, lname);
        }, 300);

        toggleInterval(this.areaLevel);
      }

      sessionStorage.removeItem('lname');
      sessionStorage.removeItem('alarmLiftId');
    },


    // 点击打开具体信息
    showInfoContent: function showInfoContent(e) {
      var contentArr = document.getElementById('info-content-ids').children;
      var tabArr = document.getElementById('info-tab-ids').children;
      // 清空所有 .selected
      for (var j = 0; j < tabArr.length; j++) {
        if (tabArr[j].classList.contains('selected')) {
          tabArr[j].classList.remove('selected');
        }
      }
      // 给当前点击项加入 .selected
      e.target.classList.add('selected');

      if (!e.target.classList.contains('clicked')) {
        for (var _j2 = 0; _j2 < tabArr.length; _j2++) {
          if (tabArr[_j2].classList.contains('clicked')) {
            tabArr[_j2].classList.remove('clicked');
          }
        }
        e.target.classList.add('clicked');
        // 显示对应的content
        for (var i = 0; i < contentArr.length; i++) {
          if (contentArr[i].className.indexOf(e.target.classList[0]) + 1) {
            contentArr[i].style.display = 'block';
          } else {
            contentArr[i].style.display = 'none';
          }
        }
      } else {
        e.target.classList.remove('selected');
        e.target.classList.remove('clicked');
        // 显示对应的content
        for (var _i2 = 0; _i2 < contentArr.length; _i2++) {
          contentArr[_i2].style.display = 'none';
        }
      }
    },


    // 点击打开表格详情
    openLogsDetail: function openLogsDetail(e) {
      this.whichContent = 'tablePage';
      var thisClass = e.target.classList[0];
      if (thisClass === 'check-alarm-btn') {
        this.logTitle = '报警按钮状态';
        this.whichTable = 'alarm';
        this.getAlarmBtnLog(this.liftId);
      } else if (thisClass === 'check-breakdown') {
        this.logTitle = '故障日志';
        this.whichTable = 'breakdown';
        this.getBreakdownLog(this.liftId);
      } else if (thisClass === 'check-events') {
        this.logTitle = '事件日志';
        this.whichTable = 'events';
        this.getEventLog(this.liftId);
      }
    },

    // 表格返回详情页
    backToDetail: function backToDetail() {
      var thisTable = this.whichTable;
      if (thisTable === 'alarm') {
        this.getAlarmBtnLog(this.liftId, 3);
      } else if (thisTable === 'breakdown') {
        this.getBreakdownLog(this.liftId, 3);
      } else if (thisTable === 'events') {
        this.getEventLog(this.liftId, 3);
      }
      this.whichContent = 'liftDetail';
    }
  },
  mounted: function mounted() {
    var _this2 = this;

    // 加载时间选择框
    {
      laydate.render({
        elem: '#next-annual-check',
        type: 'month',
        format: 'MM',
        done: function done(value) {
          _this2.popData.nextYearCheckDate = value;
        }
      });
      laydate.render({
        elem: '#lift-out-date',
        format: 'yyyy.MM.dd',
        done: function done(value) {
          _this2.popData.outDate = value;
        }
      });
      laydate.render({
        elem: '#lift-transform-date',
        format: 'yyyy.MM.dd',
        done: function done(value) {
          _this2.popData.transformDate = value;
        }
      });
      laydate.render({
        elem: '#lift-install-date',
        format: 'yyyy.MM.dd',
        done: function done(value) {
          _this2.popData.installDate = value;
        }
      });
    }

    // 加载新增电梯时的下拉列表
    {
      var THIS = this;
      // 电梯品种列表
      axios({
        url: HEADER + '/lift/check_getInstType.do'
      }).then(function (response) {
        THIS.addLiftSelect.liftKindArr = response.data.data;
      }).catch(function (error) {
        console.log(error);
      });
      // 维保单位列表
      axios({
        url: HEADER + '/maintenanceCompany/check_getMaintenanceCompanyList.do'
      }).then(function (response) {
        THIS.addLiftSelect.maintainUnitArr = response.data.data;
      }).catch(function (error) {
        console.log(error);
      });
      // 使用小区列表
      axios({
        url: HEADER + '/lift/check_getLiftUser.do'
      }).then(function (response) {
        THIS.addLiftSelect.usingCommunityArr = response.data.data;
      }).catch(function (error) {
        console.log(error);
      });
      // 维保人员
      axios({
        url: HEADER + '/user/check_getMaintStaffs.do'
      }).then(function (response) {
        THIS.addLiftSelect.maintainPersonArr = response.data.data;
      }).catch(function (error) {
        console.log(error);
      });
    }

    getLiftsData();
    loadZtree();
    //滚动条初始化
    $(function () {
      $("#treeBox").perfectScrollbar({
        wheelSpeed: 0.2,
        wheelPropagation: true,
        maxScrollbarLength: 50
      });
    });
    // 让其他页面直接进入详情页
    {
      var alarmLiftId = sessionStorage.getItem('alarmLiftId');
      if (alarmLiftId) {
        this.intoDetail(alarmLiftId);
        sessionStorage.removeItem('alarmLiftId');
      }
    }
    // 上下首尾按钮
    $('.page-bar li:not(:last)').click(function () {
      var thisClass = this.classList[0];
      Page.pageTurning(thisClass, getLiftsData, 6);
    });
    // 跳到指定页数
    document.getElementById('jump-into').onclick = function () {
      var inputPage = document.getElementById('input-page').value;
      Page.jumpIntoPage(inputPage, getLiftsData, 6);
    };
  }
});

// if (liftsMangeVM.areaLevel === 3) {
//   clearInterval(TIMER)
// }
//# sourceMappingURL=lifts_manage.js.map