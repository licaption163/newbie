package controllers

//后台首页

import (
	"github.com/astaxie/beego"
)

type BgController struct {
	beego.Controller
}

func (c *BgController) Index() {
	v := c.GetSession("sys_user")
	if v == nil {
		c.Redirect("/xdf/login", 302)
	}

	c.Data["admin"] = v
	c.TplName = "bg.html"
}
