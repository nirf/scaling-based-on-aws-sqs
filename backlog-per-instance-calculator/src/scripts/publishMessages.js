const AWS = require('aws-sdk')
const credentials = new AWS.SharedIniFileCredentials({profile: 'dev'})
AWS.config.credentials = credentials
const sqs = new AWS.SQS({
    region: 'eu-west-1'
})


sendMessages(10, 60 * 1000, 20).then(() => console.log('Finished'))

async function sendMessages(batchSize, sleepInMs, rounds) {
    for (let j = 0; j < rounds; j++) {
        for (let i = 0; i < batchSize; i++) {
            sqs.sendMessage({
                MessageAttributes: {
                    "Title": {
                        DataType: "String",
                        StringValue: "The Whistler"
                    },
                    "Author": {
                        DataType: "String",
                        StringValue: "John Grisham"
                    },
                    "WeeksOn": {
                        DataType: "Number",
                        StringValue: "6"
                    }
                },
                MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
                QueueUrl: "https://sqs.eu-west-1.amazonaws.com/399971917915/my_queue"
            }, (err, data) => {
                if (err) {
                    console.log("Error", err)
                } else {
                    console.log("Success", data.MessageId)
                }
            })
        }
        await sleep(sleepInMs)
        console.log(`>>>>>>>Finished round ${j}<<<<<<<<<<`)
    }
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}