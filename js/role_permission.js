let roleManageVM = new Vue({
  el: '#role-permission',
  data: {
    roles: [],
    selectedRoleId: '',
    permissionsList: [],
    selectedPermissions: []
  },
  methods: {
    getRoles () {
      let THIS = this
      axios({
        url: HEADER + '/role/check_RoleList.do'
      })
        .then(({data}) => {
          THIS.roles = data.data
        })
    },
    getPermissions () {
      let THIS = this
      axios({
        params: {
          roleid: THIS.selectedRoleId
        },
        url: HEADER + '/permissionRole/check_getPermissionTree.do'
      })
        .then(({data}) => {
          THIS.permissionsList = data
        })
    },
    // 全选/全不选
    isCheckAll (e) {
      let thisEle = e.target
      let allCheckbox = document.querySelectorAll('.' + thisEle.classList[0])
      for (let item of allCheckbox) {
        item.checked = thisEle.checked
      }
    },
    secondCheckAll (e) {
      let thisEle = e.target
      let allCheckbox = document.querySelectorAll('.' + thisEle.classList[1])
      for (let item of allCheckbox) {
        item.checked = thisEle.checked
      }
    },
    submitPermissions () {
      let perArr = document.querySelectorAll('.permission-checkbox')
      let selectedPerArr = []
      for (let per of perArr) {
        if (per.checked) {
          selectedPerArr.push(per.value)
        } else {
          this.selectedPermissions.splice(
            this.selectedPermissions.lastIndexOf(per.value), 1)
        }
      }
      this.selectedPermissions = selectedPerArr
      if (!this.selectedPermissions.length) {
        secondPop(0, '你还未选择权限')
      } else {
        axios({
          method: 'post',
          params: {
            roleid: this.selectedRoleId,
            permissionIds: this.selectedPermissions.join()
          },
          url: HEADER + '/permissionRole/update_RolePermission.do'
        })
          .then(({data}) => {
            if (data.status === 1) {
              secondPop(data.status, '保存成功')
            } else {
              secondPop(data.status, '保存失败')
            }
          })
      }
    }
  },
  mounted () {
    this.getRoles()

    window.onresize = function () {
      setWrapperWidth()
    }

    //滚动条初始化
    $("#table-container").perfectScrollbar()
  }
})