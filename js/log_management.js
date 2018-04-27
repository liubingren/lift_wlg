
const getlogList =(pagesize,page)=>{
  let url = HEADER + "/log/check_listLogs.do"
  let keyworks = $("#searchText").val()
  let html = ''
  $.ajax({
    type: 'get',
    url: url,
    data: {
      page:page,
      pagesize:pagesize,
      keywords: keyworks
    }, success: function (data) {
      let dataList = data.data.list
      for(let i = 0; i < dataList.length; i++){
        html += `<tr data-id="${dataList[i].id}">
                    <td>${i+1}</td>
                    <td>${!!dataList[i].username ? dataList[i].username : ''}</td>
                    <td>${!!dataList[i].modelname ? dataList[i].modelname : ''}</td>
                    <td>${!!dataList[i].ip ? dataList[i].ip : ''}</td>
                    <td>${!!dataList[i].method ? dataList[i].method : ''}</td>
                    <td title="${!!dataList[i].content ? dataList[i].content : ''}">${!!dataList[i].content ? dataList[i].content : ''}</td>
                    <td>${!!dataList[i].logdate ? dataList[i].logdate : ''}</td>
                </tr>`
      }
      $("#logInfo").html(html)
      Page.loadTotalPage(data.data);
    }
  })
}



/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
getlogList(10,1)
window.onresize = function () {
  setWrapperWidth()
}
//查询
$('#query').on('click', function () {
  $('#current-page').html(1)
  $('#input-page').val(1)
  Page.currentPage=1
  getlogList(10,1);
})



//跳转到指定页数
$("#jump-into").click(function(){
  let jumpPage=$("#input-page").val()-0;
  Page.jumpIntoPage(jumpPage,getlogList,2,10);
})

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  let thisClass = this.classList[0];
  Page.pageTurning(
    thisClass,
    getlogList,
    2,
    10)
})