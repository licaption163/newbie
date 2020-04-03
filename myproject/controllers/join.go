package controllers

import (
	"encoding/json"
	"github.com/aliyun/alibaba-cloud-sdk-go/services/dysmsapi"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/cache"
	"github.com/astaxie/beego/orm"
	"log"
	"math/rand"
	"myproject/models"
	"regexp"
	"strconv"
	"time"
)

var ca cache.Cache

type JoinController struct {
	beego.Controller
}

func (c *JoinController) Index() {
	//value := ca.Get("13164230986_reg")
	//if (value != nil) {
	//	c.Ctx.WriteString("13164230986_reg " + value.(string))
	//} else {
	//	c.Ctx.WriteString("13164230986_reg nil")
	//}

	account := c.GetString(":account")
	if account == "" {
		c.Data["msg"] = "请求错误，请联系管理员"
		c.Data["url"] = ""
		c.TplName = "msg.html"
		return
	}

	var admin models.Admin
	o := orm.NewOrm()
	err := o.QueryTable("admin").Filter("Account", account).One(&admin)
	if err == orm.ErrNoRows {
		c.Data["msg"] = "请求错误，请联系管理员"
		c.Data["url"] = ""
		c.TplName = "msg.html"
		return
	}

	c.Data["paccount"] = account
	c.Data["xsrf"] = Xrand()
	c.Data["rand"] = Code()
	c.SetSession("sys_user_xsrf", c.Data["xsrf"])
	c.SetSession("rand", c.Data["rand"])

	c.TplName = "join.html"
}

func (c *JoinController) Join() {
	// 返回值
	data := map[string]interface{}{"code": 2, "message": ""}

	// 从session里取
	xsrf := c.GetString("xsrf")
	vxsrf := c.GetSession("sys_user_xsrf")
	if xsrf == "" || xsrf != vxsrf {
		data["message"] = "参数异常"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}
	c.SetSession("sys_user_xsrf", nil)

	paccount := c.GetString("pa")
	if paccount == "" {
		data["message"] = "参数异常请联系管理员"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}

	//先不验证管理员账号是否存在
	//var admin models.Admin
	//o := orm.NewOrm()
	//err := o.QueryTable("admin").Filter("Account", paccount).One(&admin)
	//if err == orm.ErrNoRows {
	//	data := map[string]interface{}{"code": 2, "message": "请求数据库异常，请联系管理员"}
	//	c.Data["json"] = data
	//	c.ServeJSON()
	//}

	name := c.GetString("name")
	phone := c.GetString("phone")
	birthday := c.GetString("age")
	sex := c.GetString("sex")
	area := c.GetString("area")
	purpose := c.GetString("purpose")

	code := c.GetString("code")
	// 从缓存里去
	vcode := ca.Get(phone + "_reg")
	if code != vcode {
		data["message"] = "参数异常!"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}

	o := orm.NewOrm()
	var u models.User
	err := o.QueryTable("user").Filter("PAccount", paccount).Filter("Phone", phone).One(&u)
	if err != orm.ErrNoRows {
		data["message"] = "该会员已经存在"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}

	user := new(models.User)
	user.PAccount = paccount
	user.Name = name
	user.Phone = phone
	user.Birthday = birthday
	user.Age = Age(birthday)
	user.Sex = sex
	user.Area = area
	user.Purpose = purpose
	user.CreateTime = time.Now().Format("2006-01-02 15:04:05")

	_, err = o.Insert(user)
	if err == nil {
		ca.Delete(phone + "_reg")
		data["code"] = 1
		data["message"] = "成功"
		c.Data["json"] = data
		c.ServeJSON()
	} else {
		data["message"] = err.Error()
		c.Data["json"] = data
		c.ServeJSON()
	}

}

//发送验证码
func (c *JoinController) Send() {
	data := map[string]interface{}{"status": "1", "msg": ""}

	phone := c.GetString("phone")
	rand := c.GetString("rand")
	if phone == "" || rand == "" {
		data["msg"] = "手机号不能为空"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}

	vp := VerifyMobileFormat(phone)
	if vp == false {
		data["msg"] = "请检查手机号"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}

	srand := c.GetSession("rand")

	if rand != srand {
		data["msg"] = "参数有误"
		c.Data["json"] = data
		c.ServeJSON()
		return
	}

	// 给用户发的验证码
	code := Code()
	client, err := dysmsapi.NewClientWithAccessKey("cn-hangzhou", "LTAI4FomLhgtuLGNWAUwrv7p", "MmAPDCy2ix4qbD9vAxKBeiEGIhTPwd")

	request := dysmsapi.CreateSendSmsRequest()
	request.Scheme = "https"

	request.PhoneNumbers = phone
	request.SignName = "囯妙堂"
	request.TemplateCode = "SMS_176440089"
	request.TemplateParam = "{\"code\":\"" + code + "\"}"

	response, err := client.SendSms(request)
	if err != nil {
		log.Print(err.Error())
	}

	var re = make(map[string]interface{})
	err = json.Unmarshal(response.GetHttpContentBytes(), &re)
	if err != nil {
		log.Println(err.Error())
	}

	err = ca.Put(request.PhoneNumbers+"_reg", code, time.Second*300)
	if err != nil {
		log.Println(err.Error())
	}

	if re["Code"] == "OK" {
		c.SetSession("code", code)
		data["status"] = 0
		data["msg"] = "发送成功"
	} else {
		data["msg"] = re["Message"]
	}
	c.Data["json"] = data
	c.ServeJSON()
}

func VerifyMobileFormat(mobileNum string) bool {
	regular := "^1[^0-2][0-9]{9}$"
	reg := regexp.MustCompile(regular)
	return reg.MatchString(mobileNum)
}

func Code() string {
	numeric := [10]int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
	rand.Seed(time.Now().UnixNano())

	code := ""
	for i := 0; i < 6; i++ {
		code += strconv.Itoa(numeric[rand.Intn(10)])
	}
	return code
}

func Xrand() string {
	rand.Seed(time.Now().UnixNano())
	i := rand.Intn(1000)
	return md5V(strconv.Itoa(i) + time.Now().Format("2006-01-02 15:04:05"))
}

func Age(birthday string) int {
	if birthday == "" {
		return 0
	}
	ys := string([]byte(birthday)[:4])
	iys, _ := strconv.Atoi(ys)
	year, _ := strconv.Atoi(time.Now().Format("2006"))
	return year - iys
}

func init() {
	ca, _ = cache.NewCache("memory", ``)
}
