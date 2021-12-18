import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'

async function logAutoScalingGroupEvents(event, context) {
    // need to add middy to parse the event and log it where it will be easy to read
    console.log('**********************************************************')
    console.log(event)
    console.log('-------------------------------------------------------')
    console.log(JSON.stringify(event))
    console.log('**********************************************************')
}

export const handler = middy(logAutoScalingGroupEvents)
    .use(jsonBodyParser())



