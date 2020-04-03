package main

import (
	"github.com/astaxie/beego/orm"
	_ "myproject/routers"
	"github.com/astaxie/beego"
)

func main() {
	beego.Run()
}

func init() {
	orm.RegisterDataBase("default", "mysql", "root:@tcp(127.0.0.1:3306)/sys_member?charset=utf8")
}