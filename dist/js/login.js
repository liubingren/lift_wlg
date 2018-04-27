"use strict";

//const HEADER='http://172.16.31.217:8040/lift/'

//开门登录表单淡入
var show = function show(obj) {
  var num = 0;
  var st = setInterval(function () {
    num++;
    obj.style.opacity = num / 10;
    if (num >= 10) {
      clearInterval(st);
    }
  }, 200);
};
//检查用户输入的值
var flag = false;
var checkflag = false;
var msg = void 0;
var checkUser = function checkUser() {
  var username = $("#username").val().toLowerCase();
  var password = $("#password").val();
  var idcode = $("#idcode").val();
  if (username === "") {
    error("用户名不能为空！");
    $("#username").focus();
    return false;
  }
  if (password === "") {
    error("密码不能为空！");
    $("#password").focus();
    return false;
  }
  if (idcode === "") {
    error("验证码不能为空!");
    $("#idcode").focus();
    return false;
  }
  if (flag === false) {
    error("验证码错误!");
    $("#idcode").focus();
    return false;
  }
  if (!!flag) {
    $.ajax({
      async: false,
      type: 'get',
      data: {
        "username": username,
        "password": password
      },
      url: HEADER + '/login/checkUserByLogin.do',
      success: function success(data) {
        if (data.code === 1) {
          msg = data.msg + "!";
          checkflag = true;
        } else {
          msg = data.msg + "!";
        }
      }
    });
  }
  if (!checkflag) error(msg);
  return checkflag;
};
//提示信息
var error = function error(msg) {
  $("#error").html(msg);
  $("#error").fadeIn("slow").delay(1000).fadeOut("slow");
};

//验证码部分
(function () {
  var inp = document.getElementById('idcode');
  var code = document.getElementById('code');
  var c = new KinerCode({
    len: 4, //需要产生的验证码长度
    //   chars: ["1+2","3+15","6*8","8/4","22-15"],//问题模式:指定产生验证码的词典，若不给或数组长度为0则试用默认字典
    chars: [2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], //经典模式:指定产生验证码的词典，若不给或数组长度为0则试用默认字典
    question: false, //若给定词典为算数题，则此项必须选择true,程序将自动计算出结果进行校验【若选择此项，则可不配置len属性】,若选择经典模式，必须选择false
    copy: false, //是否允许复制产生的验证码
    bgColor: "white", //背景颜色[与背景图任选其一设置]
    //bgImg:"",//若选择背景图片，则背景颜色失效
    randomBg: false, //若选true则采用随机背景颜色，此时设置的bgImg和bgColor将失效
    inputArea: inp, //输入验证码的input对象绑定【 HTMLInputElement 】
    codeArea: code, //验证码放置的区域【HTMLDivElement 】
    click2refresh: true, //是否点击验证码刷新验证码
    false2refresh: false, //在填错验证码后是否刷新验证码
    validateEven: "change", //触发验证的方法名，如click，blur等
    validateFn: function validateFn(result, code) {
      //验证回调函数
      if (result) {
        flag = true;
      } else {
        $("#idcode").focus();
        flag = false;
      }
    }
  });
})(window);

/*上面是函数定义区, 下面是代码执行区**********************************************/
$("#login_area").prop("action", HEADER + "/login/main.do");
//电梯门
//let left = document.getElementsByClassName("leftDoor")[0]
var form = document.getElementsByClassName("login_form")[0];
show(form);
/*
left.addEventListener("webkitAnimationStart",function () {
  show(form)
 /!* alert(111)*!/
})*/
//# sourceMappingURL=login.js.map