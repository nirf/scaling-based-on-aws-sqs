import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'

async function logAutoScalingGroupEvents(event, context) {
    console.log({
        source: event.source,
        'detail-type': event['detail-type'],
        time: event.time,
        cause: event.detail.Cause,
        startTime: event.detail.StartTime,
        endTime: event.detail.EndTime,
        statusCode: event.detail.StatusCode
    })
}

export const handler = middy(logAutoScalingGroupEvents)
    .use(jsonBodyParser())



