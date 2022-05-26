function formsauth(){
    email = document.getElementById("email").value
    formsurl = document.getElementById("formsurl").value

    formsid = formsurl.match("/d/(.*)/")[1]

    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&prompt=consent&response_type=code&client_id=184397815875-mmmf5faqnekr2fpn2jg9ur0qj27sdfb8.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&state=" + email + "/" + formsid
}