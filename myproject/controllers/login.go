package controllers

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"myproject/models"
)

type LoginController struct {
	beego.Controller
}

func (c *LoginController) Index() {
	v := c.GetSession("sys_user")
	if v == nil {
		c.Data["xsrf"] = Xrand()
		c.SetSession("sys_user_login", c.Data["xsrf"])
		c.TplName = "login.html"
	} else {
		c.Redirect("/xdf/bg", 302)
	}
}

func (c *LoginController) Login() {
	account := c.GetString("account")
	password := c.GetString("password")

	xsrf := c.GetString("xsrf")
	vxsrf := c.GetSession("sys_user_login")
	if xsrf == "" || xsrf != vxsrf {
		c.Data["msg"] = "请求参数为空，请联系管理员"
		c.Data["url"] = "<a href='/xdf/login'>返回</a>"
		c.TplName = "msg.html"
		return
	}
	c.SetSession("sys_user_login",nil)

	var admin models.Admin
	o := orm.NewOrm()
	err := o.QueryTable("admin").Filter("Account", account).One(&admin)
	if err == orm.ErrNoRows {
		c.Data["msg"] = "请检查您的账号和密码"
		c.Data["url"] = "<a href='/xdf/login'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if md5V(password) != admin.Password {
		c.Data["msg"] = "密码不对"
		c.Data["url"] = "<a href='/xdf/login'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	c.SetSession("sys_user", account)
	c.Redirect("/xdf/bg", 302)
}

func (c *LoginController) Logout() {
	c.SetSession("sys_user", nil)
	c.Redirect("/xdf/login", 302)
}
