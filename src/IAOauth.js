class IAOAuth2 {
    constructor(clientId){
        this.clientId = clientId
        this.redirectUrl = window.location.origin+"/callback"
        this.scopes = []
        this.state = ""
    }

    setState(s) {
        this.state = s
        return this
    }

    addScope(scope) {
        this.scopes.push(scope)
        return this
    }

    setRedirect(redirect){
        if (redirect.includes("://"))
            this.redirectUrl = redirect
        else
            this.redirectUrl = window.location.origin+(redirect.startsWith("/") ? "" : window.location.pathname.replace(/[^\\/]*$/, ''))+redirect

        return this
    }

    buildURL(){
        return "https://accounts.interaapps.de/auth/oauth2"+
            "?client_id="+encodeURIComponent(this.clientId)
            +"&redirect_uri="+encodeURIComponent(this.redirectUrl)
            +"&scope="+encodeURIComponent(this.scopes.join(" "))
            +"&response_type=token"
            +(this.state != "" ? "&state="+encodeURIComponent(this.state) : '')
    }

    open(newTab = false){
        if (newTab)
            window.open(this.buildURL())
        else
            window.location = this.buildURL()
    }

    openInNewWindow(fakeURL = "/ia_fakecallback/success", checkPath=null){
        if (!checkPath)
            checkPath = fakeURL
        return new Promise((resolve, reject)=>{
            this.redirectUrl = window.location.origin+fakeURL
            const newWindow = window.open(this.buildURL(), "Authorize", "width=400,height=500")
            if(!newWindow || newWindow.closed || typeof newWindow.closed=='undefined')
            {
                this.open()
                return;
            }
            let interval;

            interval = setInterval(()=>{
                if (newWindow.closed) {
                    clearInterval(interval)
                    console.log('REJECT')
                    reject()
                    return;
                }
                if (newWindow.location.pathname.startsWith(checkPath)) {
                    console.log("DONE!", newWindow);
                    newWindow.close()

                    let params = {}

                    const paramsString = newWindow.location.hash ? newWindow.location.hash.substring(1) : newWindow.location.search.split("?")[1]


                    for (const paramString of paramsString.split("&")) {
                        const splitParamString = paramString.split("=")
                        params[decodeURIComponent(splitParamString[0])] = decodeURIComponent(splitParamString[1])
                    }

                    resolve(params)

                    clearInterval(interval)
                }
                console.log(interval);
            }, 200)
        })
    }
}

export default IAOAuth2;