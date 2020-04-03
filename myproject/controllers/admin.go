package controllers

import (
	"crypto/md5"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
	"image"
	"image/draw"
	"image/jpeg"
	"image/png"
	"io"
	"log"
	"myproject/models"
	"os"
	"time"
)

type AdminController struct {
	beego.Controller
}

func (c *AdminController) Index() {
	c.Iflogin()

	o := orm.NewOrm()
	var a []*models.Admin

	v := c.GetSession("sys_user")
	if v == "admin" {
		_, err := o.QueryTable("admin").All(&a)
		if err == orm.ErrNoRows {
			c.Data["msg"] = "没有管理员"
			c.Data["url"] = "<a href='/xdf/logout'>返回</a>"
			c.TplName = "msg.html"
		}
	} else {
		err := o.QueryTable("admin").Filter("Account", v).One(&a)
		if err == orm.ErrNoRows {
			c.Data["msg"] = "没有找到该管理员的记录"
			c.Data["url"] = "<a href='/xdf/logout'>返回</a>"
			c.TplName = "msg.html"
		}
	}

	c.Data["list"] = a
	c.Data["admin"] = v
	c.TplName = "admin.html"
}

func (c *AdminController) Add() {
	c.Iflogin()

	c.TplName = "admin_add.html"
}

func (c *AdminController) Save() {
	c.Iflogin()

	account := c.GetString("account")
	password := c.GetString("password")
	password1 := c.GetString("password1")
	memo := c.GetString("memo")

	if account == "" {
		c.Data["msg"] = "用户账号不能为空"
		c.Data["url"] = "<a href='/xdf/admin/add'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if len(account) < 5 {
		c.Data["msg"] = "账号最少5位"
		c.Data["url"] = "<a href='/xdf/admin/add'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if password != password1 {
		c.Data["msg"] = "密码不一致"
		c.Data["url"] = "<a href='/xdf/admin/add'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if len(password) < 8 {
		c.Data["msg"] = "密码最少8位"
		c.Data["url"] = "<a href='/xdf/admin/add'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if password == "11111111" || password == "12345678" {
		c.Data["msg"] = "密码不能太简单"
		c.Data["url"] = "<a href='/xdf/admin/add'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	o := orm.NewOrm()
	qs := o.QueryTable("admin")
	num, _ := qs.Filter("Account", account).Count()
	if num != 0 {
		c.Data["msg"] = "该账号已经存在，请重新输入"
		c.Data["url"] = "<a href='/xdf/admin/add'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	admin := new(models.Admin)
	admin.Account = account
	admin.Password = md5V(password)
	admin.Memo = memo
	admin.CreateTime = time.Now().Format("2006-01-02 15:04:05")
	_, err := o.Insert(admin)

	if err == nil {
		c.Redirect("/xdf/admin", 302)
	}

}

func (c *AdminController) Edit() {
	c.Iflogin()

	account := c.GetString("account")

	var admin models.Admin
	o := orm.NewOrm()
	err := o.QueryTable("admin").Filter("Account", account).One(&admin)
	if err == orm.ErrNoRows {
		c.Data["msg"] = "请确认管理员账号"
		c.Data["url"] = "<a href='/xdf/admin/'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	c.Data["admin"] = admin
	c.TplName = "admin_edit.html"
}

func (c *AdminController) Update() {
	c.Iflogin()

	account := c.GetString("account")
	password := c.GetString("password")
	password1 := c.GetString("password1")
	memo := c.GetString("memo")
	id, _ := c.GetInt64("id")

	if password != password1 {
		c.Data["msg"] = "密码不一致"
		c.Data["url"] = "<a href='/xdf/admin/edit?account=" + account + "'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if len(password) < 8 {
		c.Data["msg"] = "密码最少8位"
		c.Data["url"] = "<a href='/xdf/admin/edit?account=" + account + "'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	if password == "11111111" || password == "12345678" {
		c.Data["msg"] = "密码不能太简单"
		c.Data["url"] = "<a href='/xdf/admin/edit?account=" + account + "'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	o := orm.NewOrm()
	a := models.Admin{Id: id}
	err := o.Read(&a)
	if err == orm.ErrNoRows {
		c.Data["msg"] = "没有找到该管理员"
		c.Data["url"] = "<a href='/xdf/admin/'>返回</a>"
		c.TplName = "msg.html"
		return
	} else if err == orm.ErrMissPK {
		c.Data["msg"] = "没有找到该管理员的id"
		c.Data["url"] = "<a href='/xdf/admin/'>返回</a>"
		c.TplName = "msg.html"
		return
	} else {
		a.Password = md5V(password)
		a.Memo = memo
		if _, err := o.Update(&a); err == nil {
			c.Redirect("/xdf/admin", 302)
		} else {
			c.Data["msg"] = "修改失败"
			c.Data["url"] = "<a href='/xdf/admin/'>返回</a>"
			c.TplName = "msg.html"
			return
		}
	}

}

func (c *AdminController) View() {
	c.Iflogin()

	account := c.GetString("account")

	//生成二维码
	dir := "./static/img/ewm/"
	e := Exists(dir)
	if !e {
		err := os.Mkdir(dir, os.ModePerm)
		log.Println(err)
	}

	qrCode, _ := qr.Encode(beego.AppConfig.String("ewmurl")+account, qr.M, qr.Auto)
	qrCode, _ = barcode.Scale(qrCode, 100, 100)
	file, _ := os.Create(dir + account + ".png")
	defer file.Close()
	png.Encode(file, qrCode)

	var admin models.Admin
	o := orm.NewOrm()
	err := o.QueryTable("admin").Filter("Account", account).One(&admin)
	if err == orm.ErrNoRows {
		c.Data["msg"] = "请确认管理员账号"
		c.Data["url"] = "<a href='/xdf/admin/'>返回</a>"
		c.TplName = "msg.html"
		return
	}

	bgdir := "./static/img/bg/" + account + "/"
	//是否可以添加带背景的二维码
	if Exists(bgdir + "/1.jpg") || Exists(bgdir + "/2.jpg") || Exists(bgdir + "/3.jpg") {
		c.Data["bgup"] = true
	} else {
		c.Data["bgup"] = false
	}

	//是否已经有了带背景的二维码
	if Exists(dir + account + "_b.png") {
		c.Data["bgewm"] = true
	} else {
		c.Data["bgewm"] = false
	}

	c.Data["admin"] = admin
	c.Data["isadmin"] = c.GetSession("sys_user")
	c.TplName = "admin_view.html"
}

func (c *AdminController) Iflogin() {
	v := c.GetSession("sys_user")
	if v == nil {
		c.Redirect("/xdf/login", 302)
	}
}

func (c *AdminController) Make() {
	c.Iflogin()

	v := c.GetSession("sys_user")

	c.Data["account"] = v.(string)
	c.TplName = "admin_make.html"
}

//给当前登录管理员的二维码添加背景图片
func (c *AdminController) Makes() {
	c.Iflogin()
	v := c.GetSession("sys_user")

	ewmbg := c.GetString("ewmbg")

	if ewmbg != "" {
		err := createImg("./static/img/bg/"+v.(string)+"/"+ewmbg+".jpg", v.(string))
		if err != nil {
			c.Data["msg"] = "修改失败"
			c.Data["url"] = "<a href='/xdf/admin/make'>返回</a>"
			c.TplName = "msg.html"
			return
		} else {
			c.Redirect("/xdf/admin/view?account="+v.(string), 302)
		}
	}
}

func Exists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		if os.IsExist(err) {
			return true
		}
		return false
	}
	return true
}

func md5V(str string) string {
	w := md5.New()
	io.WriteString(w, str)
	md5str := fmt.Sprintf("%x", w.Sum(nil))
	return md5str
}

// bg 背景图片，account 当前管理员的账号
func createImg(bg string, account string) error {
	//背景图
	backgroudImgFile, _ := os.Open(bg)
	backgroudImg, _ := jpeg.Decode(backgroudImgFile)
	defer backgroudImgFile.Close()
	backgroudBound := backgroudImg.Bounds()
	//x轴坐标总数
	backgroudX := backgroudBound.Size().X
	//y轴坐标总数
	backgroudY := backgroudBound.Size().Y
	//添加图
	dir := "./static/img/ewm/"
	centerImgFile, _ := os.Open(dir + account + ".png")

	centerImg, _ := png.Decode(centerImgFile)
	defer centerImgFile.Close()
	centerBound := centerImg.Bounds()
	//x轴坐标总数
	centerX := centerBound.Size().X
	//y轴坐标总数
	centerY := centerBound.Size().Y

	//坐标偏差，x轴y轴 计算
	newImgX := (backgroudX - centerX) / 2
	newImgY := backgroudY - centerY - 128
	offset := image.Pt(newImgX, newImgY)
	//x轴坐标总数
	m := image.NewRGBA(backgroudBound)
	draw.Draw(m, backgroudBound, backgroudImg, image.ZP, draw.Src)
	draw.Draw(m, centerImg.Bounds().Add(offset), centerImg, image.ZP, draw.Over)

	//美化后的图片
	imgw, _ := os.Create(dir + account + "_b.png")
	err := jpeg.Encode(imgw, m, &jpeg.Options{jpeg.DefaultQuality})
	defer imgw.Close()
	return err
}
