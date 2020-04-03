package routers

import (
	"myproject/controllers"
	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/xdf/login", &controllers.LoginController{},"get:Index")
	beego.Router("/xdf/login", &controllers.LoginController{},"post:Login")

    beego.Router("/xdf/logout", &controllers.LoginController{},"get:Logout")

	beego.Router("/xdf/join/:account([a-z0-9]+)", &controllers.JoinController{},"get:Index")
	beego.Router("/xdf/join", &controllers.JoinController{},"post:Join")
	beego.Router("/xdf/join/send", &controllers.JoinController{},"post:Send")

	beego.Router("/xdf/list", &controllers.ListController{},"get:Index")
	beego.Router("/xdf/list/excel", &controllers.ListController{},"get:Excel")

	beego.Router("/xdf/bg", &controllers.BgController{},"get:Index")

	beego.Router("/xdf/admin", &controllers.AdminController{},"get:Index")
	beego.Router("/xdf/admin/add", &controllers.AdminController{},"get:Add")
	beego.Router("/xdf/admin/save", &controllers.AdminController{},"post:Save")
	beego.Router("/xdf/admin/make", &controllers.AdminController{},"get:Make")
	beego.Router("/xdf/admin/make", &controllers.AdminController{},"post:Makes")
	beego.Router("/xdf/admin/view", &controllers.AdminController{},"get:View")
	beego.Router("/xdf/admin/edit", &controllers.AdminController{},"get:Edit")
	beego.Router("/xdf/admin/update", &controllers.AdminController{},"post:Update")


}
