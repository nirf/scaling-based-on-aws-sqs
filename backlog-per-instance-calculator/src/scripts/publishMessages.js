const AWS = require('aws-sdk')
const credentials = new AWS.SharedIniFileCredentials({profile: 'default'})
AWS.config.credentials = credentials
const sqs = new AWS.SQS({
    region: 'eu-west-1'
})

const QueueUrl = "<enter-the-queue-url-from-terraform-output>"


sendMessages(100, 60 * 1000, 2).then(() => console.log('Finished'))

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
                QueueUrl,
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