'use strict';

var roleManageVM = new Vue({
  el: '#role-permission',
  data: {
    roles: [],
    selectedRoleId: '',
    permissionsList: [],
    selectedPermissions: []
  },
  methods: {
    getRoles: function getRoles() {
      var THIS = this;
      axios({
        url: HEADER + '/role/check_RoleList.do'
      }).then(function (_ref) {
        var data = _ref.data;

        THIS.roles = data.data;
      });
    },
    getPermissions: function getPermissions() {
      var THIS = this;
      axios({
        params: {
          roleid: THIS.selectedRoleId
        },
        url: HEADER + '/permissionRole/check_getPermissionTree.do'
      }).then(function (_ref2) {
        var data = _ref2.data;

        THIS.permissionsList = data;
      });
    },

    // 全选/全不选
    isCheckAll: function isCheckAll(e) {
      var thisEle = e.target;
      var allCheckbox = document.querySelectorAll('.' + thisEle.classList[0]);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = allCheckbox[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          item.checked = thisEle.checked;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    },
    secondCheckAll: function secondCheckAll(e) {
      var thisEle = e.target;
      var allCheckbox = document.querySelectorAll('.' + thisEle.classList[1]);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = allCheckbox[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          item.checked = thisEle.checked;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    },
    submitPermissions: function submitPermissions() {
      var perArr = document.querySelectorAll('.permission-checkbox');
      var selectedPerArr = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = perArr[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var per = _step3.value;

          if (per.checked) {
            selectedPerArr.push(per.value);
          } else {
            this.selectedPermissions.splice(this.selectedPermissions.lastIndexOf(per.value), 1);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.selectedPermissions = selectedPerArr;
      if (!this.selectedPermissions.length) {
        secondPop(0, '你还未选择权限');
      } else {
        axios({
          method: 'post',
          params: {
            roleid: this.selectedRoleId,
            permissionIds: this.selectedPermissions.join()
          },
          url: HEADER + '/permissionRole/update_RolePermission.do'
        }).then(function (_ref3) {
          var data = _ref3.data;

          if (data.status === 1) {
            secondPop(data.status, '保存成功');
          } else {
            secondPop(data.status, '保存失败');
          }
        });
      }
    }
  },
  mounted: function mounted() {
    this.getRoles();

    window.onresize = function () {
      setWrapperWidth();
    };

    //滚动条初始化
    $("#table-container").perfectScrollbar();
  }
});
//# sourceMappingURL=role_permission.js.map