let express = require('express')//node搭建server
let bodyParser = require('body-parser')
let request = require('request')//發送http request
let app = express()//創立app的實體

const FACEBOOK_ACCESS_TOKEN = 'EAABozUSjqe8BAHGPBZBZB3DdaPyt0wRkUVdMM8P2KqjZCOWzqtYdX3coqqQ8TJuWHgy8l6MtsdlxVThD5UG82iYCcDQQ1dFZAzQim5T7Pj8zajZCv9aN5vaI8kVefZBHhmvc8LRHjrAEgHYlxWMZB9vD4fy8FmDKPM938WPEIDImgZDZD'
const PORT = process.env.PORT || 3000
const VERIFY_TOKEN = 'chatbot92_steven_Verify_Token'   // FB同時也會把verify token打過來(設定為自己知道)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.listen(PORT, function () {
    console.log(`App listening on port ${PORT}!`)
})

// Facebook Webhook   
app.get('/hi', function (req, res) {            //處理FB的驗證
    //server在路徑為左時，會做以下處理，先做http get，FB會下hub.verify_token的參數
    // 以及hub.challenge(一個隨機的值)  要回傳相同hub.challenge的該值做認證!!

    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {    //如果認證對的  
        res.send(req.query['hub.challenge'])          // 回傳hub.challenge的值，其實可發現若一律回傳這個就不用管認證了
    } else {
        res.send('Invalid verify token')     
    }
})

// handler receiving messages         
// FB 認證後，送post到相同位址
app.post('/', function (req, res) {
    let events = req.body.entry[0].messaging    // FB打的訊息: req.body, 要看spec:format在:https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message

    for (i = 0; i < events.length; i++) {
        let event = events[i]
        if (event.message) {
            if (event.message.text) {     //如果有text欄，則送出sender 的text
                sendMessage(event.sender.id, { text: event.message.text })
            }
        }
    }
    res.sendStatus(200)
})

// generic function sending messages
function sendMessage(recipientId, message) {     //  FB send api:https://developers.facebook.com/docs/messenger-platform/reference/send-api#response
    let options = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: recipientId },
            message: message,
        }
    }
    request(options, function (error, response, body) {   //options的東西需要看request的SPEC:https://github.com/request/request#requestoptions-callback
        if (error) {
            console.log('Error sending message: ', error);
        }
        else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
}
