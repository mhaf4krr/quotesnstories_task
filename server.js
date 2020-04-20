
/* This service is build using googleapi SDK
*/

const express = require("express")

const app = express()

const { google } = require("googleapis")

const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({extended:true}))


/* query-string required to extract code from google redirect url */
const queryString = require("query-string")

app.use(express.static("public"))

app.engine('html', require('ejs').renderFile);

app.set("view engine","html")





/* Credentials for application acquired from google dev console */

const googleConfig = {
  clientId :  "720665991467-ts9n6qp9blifj2qafsbsjjmh30ah7dk6.apps.googleusercontent.com",
  clientSecret : "wdPgMS4CSAhNFwXpCsAx-7SJ",
  
}


/* Redirect URLs to handle show and add */
let redirect_url_show = "http://localhost:5000/google-auth"
let redirect_url_add = "http://localhost:5000/calendar-add-event"




/* BASIC ROUTE HANDLING */


app.get("/show-events",(req,res)=>{
 
  let url = urlGoogle(redirect_url_show)
  res.redirect(url)
})


app.get("/add-event",(req,res)=>{

  let url = urlGoogle(redirect_url_add)
  res.redirect(url)
})





app.post("/add-event", async (req,res)=>{
  let data = req.body
  console.log(data)
  let code = data.token

  /* Change the redirect url */


  let calendar = await createCalendarAuth(code,redirect_url_add)


  calendar = calendar.calendar

  let date = new Date()
  let formatted_date = `2020-04-${date.getDate()}`
  let end_date = `2020-04-${date.getDate()+1}`


  let event = {
    'summary':data.title,
    'description':data.body,
      'start':{
        date:formatted_date
     
      },

      'end':{
        date:end_date
      
      },
    'attendess':[{
      'email':data.email
    }]
  }
  

 

  calendar.events.insert({
    auth:calendar.auth,
    calendarId:'primary',
    resource:event
  },(err, event)=>{
    if(err){
      console.log("Error " + err)
      res.send("Error occured")

      return
    }

    console.log("Success")
    res.status(200).send("<html> The event has been added to your calendar, please check your calendar : <a href='http://localhost:5000/show-events'> here </a> </html>" )
  })


 


})


/* redirect url for adding events data */
app.get("/calendar-add-event",(req,res)=>{
  let code =  queryString.parseUrl(req.originalUrl).query.code
  res.header("x-access-token",code).render("addevent",{code:{access:code}})
})



/* Google redirected URL for showing events */

app.get("/google-auth", async (req,res,next)=>{
     
     
   let code =  queryString.parseUrl(req.originalUrl).query.code
  
  

   let calendar = await createCalendarAuth(code,redirect_url_show)

   calendar = calendar.calendar

   

   let events = await getEventsData(calendar)

   console.log(events)

   res.render("events",{data:events})
   
})





/*@createConnection: helper function returns an auth object used for accessing, creating events */

function createConnection(redirect_url){
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    redirect_url
  )
}



/* @defaultScope: permissions required from the user */
const defaultScope = [
  'https://www.googleapis.com/auth/calendar',
]



/*@ getConnectionURL : helper function returns url auth object used in urlGoogle function */
function getConnectionURL(auth) {
  return auth.generateAuthUrl({
    access_type : "offline",
    promopt : "consent",
    scope : defaultScope
  })
}


/*@ urlGoogle : helper function returns url which user needs to be redirected for consent form */

function urlGoogle(redirect){
  const auth = createConnection(redirect)
  const url = getConnectionURL(auth)
  return url;
}




/* @createCalendarAuth : helper function returns an object with auth and calendar */

async function createCalendarAuth(code,redirect_url){

  let auth = createConnection(redirect_url)
  const data = await auth.getToken(code)
  const tokens = data.tokens

 
  auth.setCredentials(tokens)

  const calendar = google.calendar({
    version:'v3',
    auth
  })

  return {
    calendar:calendar,
    auth:auth
  }
}



/*@ getEventsData : function returns events data related to user */

 function getEventsData(calendar){
  return new Promise((resolve,reject)=>{

  calendar.events.list({
    calendarId:"primary",
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  },

  (err,res) =>{
    if(err) {
      console.log("API returned an error " + err)
    }
    else {
      const events = res.data.items
      if (events.length == 0){
        reject("No Events")
      }

      else {
      
       resolve(events)
      }
    }
  })
  })
}

app.listen(5000)