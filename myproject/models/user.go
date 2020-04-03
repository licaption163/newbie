package models

import (
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

// 用户
type User struct {
	Id   int64  `orm:"auto"`
	PAccount string `orm:"size(100)"`
	Name  string  `orm:"column(name)" description:"name"`
	Phone  string  `orm:"column(phone)" description:"联系方式"`
	Birthday  string  `orm:"column(birthday)"`
	Age  int  `orm:"column(age)"`
	Sex  string  `orm:"column(sex)"`
	Area  string  `orm:"column(area)"`
	Purpose  string  `orm:"column(purpose)"`
	CreateTime  string  `orm:"column(create_time)"`
}


func init() {
	orm.RegisterModel(new(User))
}
