package models

import (
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

// 管理员
type Admin struct {
	Id         int64  `orm:"auto"`
	Account    string `orm:column(account) description:"管理员账号"`
	Password   string `orm:column(password) description:"密码"`
	Memo       string `orm:column(memo) description:"备注"`
	CreateTime string `orm:column(create_time) description:"密码"`
}

// 初始化模型
func init() {
	orm.RegisterModel(new(Admin))
}
