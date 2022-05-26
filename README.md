
<h1>Google Forms Mail Notification &nbsp; <img src="https://www.computerhope.com/jargon/g/google-forms.png" width="90" height="80" style="margin-top: 100px"/>  &nbsp; 
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png" width ="100" height="70px" /></h1>

---

This is a simple application that demonstrates the functionality of Google API and adds a simple feature that is a person with a totally different mail can get notified if a form is filled with responses.

#### Note

> This project is just to demonstrate a functionality of Google Forms API. <br>
> There are many features that can be added.


#### Requirements
> Go to GCP and create a new project.<br>
> Enable Forms API for the project.<br>
> Create Oauth Client.<br>
> Enable Pub/Sub and create a topic.

#### Installation
> `git clone https://github.com/reach-the-sky/Google-Forms-Mail-Notification.git` <br>
> Add _.env_ file and fill in the values
> - EMAIL_ID : To send mail using SMTP.
> - EMAIL_PASSWORD : To authenticate mail.
> - CLIENT_ID : Oauth client authentication (get it from google project).
> - CLIENT_SECRET : It is with the CLIENT_ID.
> - TOPIC_NAME : Pub/Sub topic path ( ex: "**projects/{project_name}/topics/{topic_name}**" ).


If you liked my project and appreciate the content I opensource, consider following me on github [🌥](https://github.com/reach-the-sky).
