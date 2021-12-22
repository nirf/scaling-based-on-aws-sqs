import AWS from 'aws-sdk'
import {Consumer} from 'sqs-consumer'

const sqs = process.env.LOCALSTACK_ENABLED === 'true' ? new AWS.SQS({endpoint: 'http://localhost:4566'}) : new AWS.SQS()

const app = Consumer.create({
    queueUrl: process.env.QUEUE_URL,
    sqs,
    waitTimeSeconds: 20,
    pollingWaitTimeMs: 1,
    visibilityTimeout: 75,
    attributeNames: ['All'],
    batchSize: 1,
    async handleMessage(message) {
        await sleep(60 * 1000)
    }
})

app.on('error', (err) => {
    console.error('error', err.message)
})

app.on('processing_error', (err) => {
    console.error('processing_error', err.message)
})

app.on('timeout_error', (err) => {
    console.error('timeout_error', err.message)
})

app.on('message_received', (message) => {
    console.error('message_received', message)
})

app.on('message_processed', (message) => {
    console.error('message_processed', message)
})

app.on('response_processed', () => {
    console.error('response_processed')
})

app.on('stopped', () => {
    console.error('stopped')
})

app.on('empty', () => {
    console.error('empty')
})

app.start()

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}