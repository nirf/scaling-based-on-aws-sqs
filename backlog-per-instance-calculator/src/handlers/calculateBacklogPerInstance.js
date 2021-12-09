import AWS from 'aws-sdk'

const sqs = new AWS.SQS()
const autoScaling = new AWS.AutoScaling()
const cloudWatch = new AWS.CloudWatch()

async function calculateBacklogPerInstance(event, context) {
    const approximateNumberOfMessage = await getApproximateNumberOfMessages(process.env.QUEUE_URL)
    console.log('approximateNumberOfMessage', approximateNumberOfMessage)
    const runningInstances = await getRunningInstances(process.env.ASG_NAME)
    console.log('runningInstances', runningInstances)
    const backlogPerInstance = getBacklogPerInstance(runningInstances, approximateNumberOfMessage)
    console.log('backlogPerInstance', backlogPerInstance)
    const response = await putMetricData(backlogPerInstance)
    console.log('cloudWatch putMetricData response', response)
}

async function getApproximateNumberOfMessages(queueUrl) {
    const queueAttributesResponse = await sqs.getQueueAttributes({
        QueueUrl: queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages']
    }).promise()

    return queueAttributesResponse.Attributes.ApproximateNumberOfMessages
}

async function getRunningInstances(autoScalingGroupName) {
    const autoScalingDescriptionResponse = await autoScaling.describeAutoScalingGroups({
        AutoScalingGroupNames: [autoScalingGroupName]
    }).promise()

    return autoScalingDescriptionResponse.AutoScalingGroups[0].Instances
        .filter(instance => instance.LifecycleState === 'InService')
        .length
}

function getBacklogPerInstance(runningInstances, approximateNumberOfMessage) {
    return runningInstances === 0 ? 0 : approximateNumberOfMessage / runningInstances;
}

function putMetricData(backlogPerInstance) {
    return cloudWatch.putMetricData({
        MetricData: [
            {
                MetricName: 'BacklogPerInstance',
                Dimensions: [
                    {
                        Name: 'Project',
                        Value: 'SQSAutoScalingDemo'
                    }
                ],
                Unit: 'None',
                Value: backlogPerInstance,
            }
        ],
        Namespace: 'SQS/AutoScaling',
    }).promise();
}

export const handler = calculateBacklogPerInstance



