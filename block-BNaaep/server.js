let http = require(`http`)
let fs = require(`fs`)
let url = require(`url`)
let qs = require(`querystring`)

let server = http.createServer(handleServer)

function handleServer(req, res){
    let store = ``;
    req.on(`data`, (chunk) => {
        store += chunk;
    })

    req.on(`end`, () => {
        //Handling Index page
        if(req.url === `/` && req.method === `GET`) {
            handleIndex(store, res)

        }
        //Handling About page
        if(req.url === `/about` && req.method === `GET`) {
            handleAbout(res)
        }
        //Handling Images
        if(req.method === `GET` && req.url.split(`.`).pop() === `png`) {
            let imgFile = req.url
            console.log(imgFile)
            handleImages(res, imgFile)
        }
        //Handling Images
        if(req.method === `GET` && req.url.split(`.`).pop() === `css`) {
            let cssFile = req.url
            console.log(cssFile)
            handleCSS(res, cssFile)
        }
         //Handling GET on /form
         if(req.method === `GET` && req.url === `/form`) {
            handleFormGET(res)
            
        }
         //Handling POST on /form
         if(req.method === `POST` && req.url === `/form`) {
            handleFormPOST(store, req, res)
        }
         //Handling GET on /users
         if(req.method === `GET` && req.url.split(`?`).shift() === `/users`) {
            handleUsersGET(store, req, res)
        }

         //Handling GET on all /users
         if(req.method === `GET` && req.url=== `/usersall`) {
            handleAllUsersGET(store, req, res)
        }
    })
}

function handleIndex(store, res) {
    fs.createReadStream(__dirname + `/index.html`).pipe(res)
}

function handleAbout(res){
    fs.createReadStream(__dirname + `/about.html`).pipe(res)


}
function handleCSS(res, cssFile) {
    res.setHeader("Content-Type", "css")
    fs.createReadStream(__dirname + cssFile).pipe(res)
}

function handleImages(res, imgFile) {
    res.setHeader("Content-Type", "image/png")
    fs.createReadStream(__dirname + imgFile).pipe(res)
}

function handleFormGET(res){
    fs.createReadStream(__dirname + `/form.html`).pipe(res)
}

function handleFormPOST(store, req, res){
    let parsedURL = qs.parse(store)
    let username = parsedURL.username

    fs.open(__dirname + `/contacts/` + username + `.json`, `wx+`, (err, fd) => {
        if(err) throw new Error(`Username Taken`);
        fs.write(fd, JSON.stringify(parsedURL), (err) => {
            if(err) console.log(err)
        })
        fs.close(fd, (err) => {
            if(err) console.log(err)
            res.end(`Contact added succesfully`)
        })
    })
    
}

server.listen(8000, () => {
    console.log(`server listening on port 8000`)
})


function handleUsersGET(store, req, res){
    let parsedURL = url.parse(req.url, true)
    console.log(parsedURL, `--parsedURL users`)
    let username = parsedURL.query.username
    console.log(__dirname + `/contacts/${username}` + `.json --filename`)
    fs.readFile(__dirname + `/contacts/${username}` + `.json`, `utf-8`, (err, content) => {
        if(err) console.log(err)
        console.log(content, `data n content of users`)
        let data = JSON.parse(content)
        res.end(`
        <h1>USER DATA: ${data.username}</h1>
        <h2>Name: ${data.name}</h2>
        <h2>Age: ${data.age}</h2>
        <h2>Email: ${data.email}</h2>
        <h2>Bio: ${data.bio}</h2>
        `)
    })
}

function handleAllUsersGET(store, req, res) {
    let allUsers =``;
    fs.readdir(__dirname + `/contacts/`, (err, files) => {
        if(err) console.log(err);
        console.log(files, `FILES`)
        files.forEach((file, index) => {
            
            fs.readFile(__dirname + `/contacts/${file}`, `utf-8`, (err, content) => {
                if(err) console.log(err)
                let data = JSON.parse(content)
                // res.setHeader("Content-Type", "text/html")
                
                allUsers = allUsers.concat(" ", 
                `<div class=".padding">
                <h1>USER DATA: ${data.username}</h1>
                <h2>Name: ${data.name}</h2>
                <h2>Age: ${data.age}</h2>
                <h2>Email: ${data.email}</h2>
                <h2>Bio: ${data.bio}</h2>
                </div>
                ` )
                console.log(index, files.length, "index n files length")
                if(index === 0) {
                    //how is index working in reverseee, dont know!!!
                    console.log(allUsers, `ALL USERS inner`)

                    res.end(`${allUsers}`)
                }
            })
        })
    })
}