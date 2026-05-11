package service

import (
	"fmt"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	host    string
	port    int
	user    string
	pass    string
	from    string
	appURL  string
}

func NewEmailService(host string, port int, user, pass, from, appURL string) *EmailService {
	return &EmailService{host: host, port: port, user: user, pass: pass, from: from, appURL: appURL}
}

func (e *EmailService) send(to, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("ZanAjira Portal <%s>", e.from))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(e.host, e.port, e.user, e.pass)
	return d.DialAndSend(m)
}

func (e *EmailService) SendActivation(to, token string) error {
	link := fmt.Sprintf("%s/activate?token=%s", e.appURL, token)
	body := fmt.Sprintf(`
<p>Karibu ZanAjira — Welcome to ZanAjira Portal!</p>
<p>Please click the link below to activate your account:</p>
<p><a href="%s">Activate My Account</a></p>
<p>This link expires in 24 hours.</p>
<p>If you did not register, please ignore this email.</p>
<br>
<p>Civil Service Commission<br>Revolutionary Government of Zanzibar</p>
`, link)
	return e.send(to, "Activate Your ZanAjira Account", body)
}

func (e *EmailService) SendPasswordReset(to, token string) error {
	link := fmt.Sprintf("%s/reset-password?token=%s", e.appURL, token)
	body := fmt.Sprintf(`
<p>You requested a password reset for your ZanAjira account.</p>
<p>Click the link below to reset your password:</p>
<p><a href="%s">Reset My Password</a></p>
<p>This link expires in 2 hours.</p>
<p>If you did not request this, please ignore this email.</p>
<br>
<p>Civil Service Commission<br>Revolutionary Government of Zanzibar</p>
`, link)
	return e.send(to, "ZanAjira — Password Reset Request", body)
}

func (e *EmailService) SendApplicationConfirmation(to, postTitle, employerName string) error {
	body := fmt.Sprintf(`
<p>Dear Applicant,</p>
<p>Your application for the position of <strong>%s</strong> at <strong>%s</strong> has been received successfully.</p>
<p>You can track the status of your application by logging into your ZanAjira account and visiting "My Applications".</p>
<br>
<p>Civil Service Commission<br>Revolutionary Government of Zanzibar</p>
`, postTitle, employerName)
	return e.send(to, "ZanAjira — Application Received", body)
}

func (e *EmailService) SendStatusUpdate(to, postTitle, status string) error {
	body := fmt.Sprintf(`
<p>Dear Applicant,</p>
<p>The status of your application for <strong>%s</strong> has been updated to: <strong>%s</strong>.</p>
<p>Log in to your ZanAjira account for more details.</p>
<br>
<p>Civil Service Commission<br>Revolutionary Government of Zanzibar</p>
`, postTitle, status)
	return e.send(to, "ZanAjira — Application Status Update", body)
}
