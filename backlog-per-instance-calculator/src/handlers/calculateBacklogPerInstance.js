import AWS from 'aws-sdk'

const sqs = new AWS.SQS()
const autoScaling = new AWS.AutoScaling()
const cloudWatch = new AWS.CloudWatch()

async function calculateBacklogPerInstance(event, context) {
    const approximateNumberOfMessages = await getApproximateNumberOfMessages(process.env.QUEUE_URL)
    const runningInstances = await getRunningInstances(process.env.ASG_NAME)
    const calculatedBacklogPerInstance = getBacklogPerInstance(approximateNumberOfMessages, runningInstances)
    const backlogPerInstancePutMetricDataResponse = await putBacklogPerInstanceMetricData(calculatedBacklogPerInstance)

    console.log({
        approximateNumberOfMessages,
        runningInstances,
        calculatedBacklogPerInstance,
        backlogPerInstancePutMetricDataResponse,
        time: new Date().toISOString()
    })
}

async function getApproximateNumberOfMessages(queueUrl) {
    const queueAttributesResponse = await sqs.getQueueAttributes({
        QueueUrl: queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages']
    }).promise()

    return parseInt(queueAttributesResponse.Attributes.ApproximateNumberOfMessages)
}

async function getRunningInstances(autoScalingGroupName) {
    const autoScalingDescriptionResponse = await autoScaling.describeAutoScalingGroups({
        AutoScalingGroupNames: [autoScalingGroupName]
    }).promise()

    return autoScalingDescriptionResponse.AutoScalingGroups[0].Instances
        .filter(instance => instance.LifecycleState === 'InService')
        .length
}

function getBacklogPerInstance(approximateNumberOfMessages, runningInstances) {
    return runningInstances === 0 ? 0 : approximateNumberOfMessages / runningInstances
}

function putBacklogPerInstanceMetricData(backlogPerInstance) {
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



