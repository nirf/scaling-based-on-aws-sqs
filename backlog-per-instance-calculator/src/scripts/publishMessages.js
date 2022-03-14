const AWS = require('aws-sdk')
const credentials = new AWS.SharedIniFileCredentials({profile: 'default'})
AWS.config.credentials = credentials
const sqs = new AWS.SQS({
    region: '<paste-url-here-from-terraform-output>'
})

const QueueUrl = "<paste-queue-url-here-from-terraform-output>"


sendMessages(50).then(() => console.log('Finished'))

async function sendMessages(batchSize) {
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
}