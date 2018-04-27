'use strict';

var companyAnnualCheckVM = new Vue({
  el: '#company-annual-check',
  data: {
    checkRecords: [],
    registerCode: '',
    insideCode: '',
    selectedRecords: [], // 勾选的年检记录
    // 弹窗参数
    isAddBtn: true,
    userCommunities: [], // 使用小区列表
    showSelect: false, // 是否显示下拉菜单
    selectedId: '', // 弹窗小区ID
    selectedName: '', // 弹窗使用小区名字
    checkTime: '',
    popLifts: [], // 弹窗里的电梯列表
    fileNames: '',
    filesArr: [],
    downloadFiles: [], // 从后台下载的文件
    selectedUrl: '', // 要删除的文件
    selectedLiftId: '' // 弹窗里选择的电梯
  },
  methods: {
    // 获取记录列表
    getRecords: function getRecords(page, pagesize) {
      var THIS = this;
      axios({
        url: HEADER + '/inspectionrecord/check_listComInsRecord.do',
        params: {
          page: page,
          pagesize: pagesize,
          id_nr: THIS.registerCode,
          unit_id: THIS.insideCode
        }
      }).then(function (_ref) {
        var data = _ref.data;

        THIS.checkRecords = data.data.list;
        Page.loadTotalPage(data.data);
      });
    },

    // 点击勾选框获取 record_id
    getRecordId: function getRecordId(e) {
      var id = e.target.getAttribute('for');
      var check = document.getElementById(id).checked;
      if (!check) {
        this.selectedRecords.push(id);
      } else {
        for (var i = 0; i < this.selectedRecords.length; i++) {
          if (this.selectedRecords[i] === id) {
            this.selectedRecords.splice(i, 1);
          }
        }
      }
    },

    // 打开新增弹窗
    openAddAnnualRecord: function openAddAnnualRecord() {
      this.selectedId = this.selectedName = this.checkTime = '';
      this.popLifts = this.filesArr = [];
      this.isAddBtn = true;
      openPop('annual-check-pop');
      this.loadPopData();
      this.getFiles();
    },

    // 加载弹窗里的各项数据
    loadPopData: function loadPopData() {
      var THIS = this;
      axios({
        url: HEADER + '/inspectionrecord/check_listLocation.do'
      }).then(function (_ref2) {
        var data = _ref2.data;

        THIS.userCommunities = data.data;
      });
      laydate.render({
        elem: '#select-company-check-time',
        type: 'month',
        format: 'yyyy-MM',
        change: function change(value) {
          THIS.checkTime = value;
          THIS.getLiftsTable();
        }
      });
    },

    // 点击选择小区
    selectCommunity: function selectCommunity(id, name) {
      this.selectedName = name;
      this.selectedId = id;
      this.showSelect = false;
      this.getLiftsTable();
    },

    // 根据小区ID和自检时间获取电梯表格
    getLiftsTable: function getLiftsTable() {
      var THIS = this;
      axios({
        url: HEADER + '/inspectionrecord/check_ListLiftByLidAndMon.do',
        params: {
          lid: THIS.selectedId,
          mon: THIS.checkTime
        }
      }).then(function (_ref3) {
        var data = _ref3.data;

        THIS.popLifts = data.data;
      });
    },

    // 点击单选框选择电梯
    selectLift: function selectLift(e) {
      this.selectedLiftId = e.target.getAttribute('data-lift_id');
    },

    // 添加文件
    getFiles: function getFiles() {
      var THIS = this;
      var addBtn = document.getElementById('add-img');
      var reader = new FileReader();
      addBtn.onchange = function () {
        THIS.downloadFiles = [];
        var file = this.files[0];
        THIS.filesArr.push(file);
      };
    },

    // 删除提交前的文件
    deleteImgBefore: function deleteImgBefore(dom) {
      var li = $(dom).parents('li');
      var index = li.index();
      this.filesArr.splice(index, 1);
      li.remove();
    },

    // 提交信息
    submitInfo: function submitInfo() {
      // axios({
      //   method: 'post',
      //   headers: {'Content-Type': 'multipart/form-data'},
      //   url: HEADER + '/inspectionrecord/add_insRecord.do',
      //   params: jsonData
      // })
      //   .then(({data}) => {
      //     console.log(data)
      //     secondPop(data.code, data.msg)
      //   })
      //   .catch((error) => {
      //     console.log(error)
      //   })
      var jsonData = new FormData();
      for (var i = 0; i < this.filesArr.length; i++) {
        jsonData.append('file', this.filesArr[i]);
      }
      var THIS = this;
      jsonData.append('lift_id', this.selectedLiftId);
      jsonData.append('type', 1);
      if (THIS.isAddBtn) {
        $.ajax({
          type: 'post',
          data: jsonData,
          contentType: false,
          processData: false,
          url: HEADER + '/inspectionrecord/add_insRecord.do',
          success: function success(data) {
            secondPop(data.code, data.msg);
            if (data.code === 1) {
              THIS.getRecords();
            }
          }
        });
      } else {
        jsonData.append('record_id', THIS.selectedRecords[0]);
        $.ajax({
          type: 'post',
          data: jsonData,
          contentType: false,
          processData: false,
          url: HEADER + '/inspectionrecord/upate_insRecord.do',
          success: function success(data) {
            secondPop(data.code, data.msg);
            if (data.code === 1) {
              THIS.getRecords();
            }
          }
        });
      }
    },

    //  打开修改弹窗
    openEditPop: function openEditPop() {
      var length = this.selectedRecords.length;
      if (!length) {
        secondPop(0, '请先选择检验记录!');
      } else if (length > 1) {
        secondPop(0, '一次只能选择一条记录!');
      } else {
        this.isAddBtn = false;
        openPop('annual-check-pop');
        this.loadPopData();
        // 获取该记录原本的内容
        var THIS = this;
        // 清除未提交的新增文件
        THIS.downloadFiles = [];
        axios({
          url: HEADER + '/inspectionrecord/check_getRecordById.do',
          params: {
            record_id: THIS.selectedRecords[0]
          }
        }).then(function (_ref4) {
          var data = _ref4.data;

          var thisRecords = data.data;
          THIS.selectedName = thisRecords.user;
          THIS.checkTime = thisRecords.next_annual_inspection_date;
          THIS.getLiftsTable();
          THIS.selectedLiftId = thisRecords.lift_id;
          // 预览文件
          if (thisRecords.file_url) {
            var files = thisRecords.file_url.split(',');
            for (var i = 0; i < files.length; i++) {
              var fileName = files[i].slice(files[i].search('r') + 1);
              var file = {
                name: fileName,
                url: files[i]
              };
              THIS.downloadFiles.push(file);
            }
          }
          THIS.filesArr = [];
        });
        this.getFiles();
      }
    },

    // 打开删除窗口
    openDelete: function (_openDelete) {
      function openDelete() {
        return _openDelete.apply(this, arguments);
      }

      openDelete.toString = function () {
        return _openDelete.toString();
      };

      return openDelete;
    }(function () {
      var length = this.selectedRecords.length;
      if (!length) {
        secondPop(0, '请先选择检验记录!');
      } else if (length === 1) {
        openDelete('确认删除该记录?');
      } else {
        openDelete('确认删除这些记录?');
      }
    }),

    // 确认删除电梯
    confirmDeleteLift: function confirmDeleteLift(url) {
      var THIS = this;
      if (url) {
        axios({
          method: 'post',
          url: HEADER + '/inspectionrecord/delete_File.do',
          params: {
            record_id: this.selectedRecords.join(),
            fileurl: this.selectedUrl
          }
        }).then(function (_ref5) {
          var data = _ref5.data;

          secondPop(data.code, data.msg);
        });
      } else {
        axios({
          method: 'post',
          url: HEADER + '/inspectionrecord/delete_InsRecord.do',
          params: {
            record_id: this.selectedRecords.join()
          }
        }).then(function (_ref6) {
          var data = _ref6.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getRecords();
          }
        });
      }
    },

    // 打开删除文件窗口
    openDeleteFile: function openDeleteFile(url, index) {
      openDelete('确认删除该文件?');
      this.selectedUrl = url;
    }
  },
  mounted: function mounted() {
    window.onresize = function () {
      setWrapperWidth();
    };
    this.getRecords();

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
//# sourceMappingURL=company_annual_check_record.js.map
//# sourceMappingURL=company_annual_check_record.js.map