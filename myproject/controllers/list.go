package controllers

import (
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"github.com/tealeg/xlsx"
	"math"
	"myproject/models"
	"os"
	"strconv"
)

type ListController struct {
	beego.Controller
}

func (c *ListController) Index() {
	v := c.GetSession("sys_user")
	if v == nil {
		c.Redirect("/xdf/login", 302)
	}

	p, _ := c.GetInt64("p", 1)
	pageSize := int64(20)
	offset := (p - 1) * pageSize

	o := orm.NewOrm()

	qs := o.QueryTable("user")
	num, _ := qs.Filter("PAccount", v).Count()

	totalPage := int(math.Ceil(float64(num) / float64(pageSize)))

	page := ""
	if totalPage > 1 {
		page += "<div class=\"layui-box layui-laypage layui-laypage-default\">"
		for i := 1; i <= int(totalPage); i++ {
			if int(p) == i {
				page += "<span class=\"layui-laypage-curr\"><em class=\"layui-laypage-em\"></em><em>" + strconv.Itoa(i) + "</em></span>"
			} else {
				page += "<a href='/xdf/list?p=" + strconv.Itoa(i) + "'>" + strconv.Itoa(i) + "</a>"
			}
		}
		page += "</div>"
	}

	var user []*models.User
	qs.Limit(pageSize, offset).Filter("PAccount", v).All(&user)

	if num == 0 {
		fmt.Println("查询不到")
	}

	c.Data["list"] = user
	c.Data["admin"] = v
	c.Data["page"] = page

	c.TplName = "list.html"
}

func (c *ListController) Excel() {
	v := c.GetSession("sys_user")
	if v == nil {
		c.Redirect("/xdf/login", 302)
	}

	excelfile, err := ExportExcel(v.(string))
	if err == nil {
		c.Ctx.Output.Download(excelfile, "会员.xlsx")
	}
}

func ExportExcel(v string) (filename string, err error) {
	var file *xlsx.File
	var sheet *xlsx.Sheet
	var row *xlsx.Row
	var cell *xlsx.Cell

	file = xlsx.NewFile()
	sheet, _ = file.AddSheet("sheet1")
	row = sheet.AddRow()

	cell = row.AddCell()
	cell.Value = "姓名"

	cell = row.AddCell()
	cell.Value = "手机号"

	cell = row.AddCell()
	cell.Value = "生日"

	cell = row.AddCell()
	cell.Value = "年龄"

	cell = row.AddCell()
	cell.Value = "性别"

	cell = row.AddCell()
	cell.Value = "地址"

	cell = row.AddCell()
	cell.Value = "用途"

	cell = row.AddCell()
	cell.Value = "注册时间"

	o := orm.NewOrm()
	qs := o.QueryTable("user")
	var user []*models.User
	qs.Filter("PAccount", v).All(&user)

	for _, val := range user {
		row = sheet.AddRow()
		cell = row.AddCell()
		cell.Value = val.Name
		cell = row.AddCell()
		cell.Value = val.Phone
		cell = row.AddCell()
		cell.Value = val.Birthday
		cell = row.AddCell()
		cell.Value = strconv.Itoa(val.Age)
		cell = row.AddCell()
		cell.Value = val.Sex
		cell = row.AddCell()
		cell.Value = val.Area
		cell = row.AddCell()
		cell.Value = val.Purpose
		cell = row.AddCell()
		cell.Value = val.CreateTime
	}

	dir := "./static/excel/"
	e := Exists(dir)
	if !e {
		os.Mkdir(dir, os.ModePerm)
	}
	filename = dir + v + ".xlsx"
	err = file.Save(filename)
	return filename, err
}
