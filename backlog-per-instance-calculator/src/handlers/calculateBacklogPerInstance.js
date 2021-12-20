import AWS from 'aws-sdk'

const sqs = new AWS.SQS()
const autoScaling = new AWS.AutoScaling()
const cloudWatch = new AWS.CloudWatch()

async function calculateBacklogPerInstance(event, context) {
    const approximateNumberOfMessages = await getApproximateNumberOfMessages(process.env.QUEUE_URL)
    const runningInstances = await getRunningInstances(process.env.ASG_NAME)
    const calculatedBacklogPerInstance = getBacklogPerInstance(approximateNumberOfMessages, runningInstances, parseInt(process.env.ACCEPTABLE_BACKLOG_PER_INSTANCE))
    const backlogPerInstancePutMetricDataResponse = await putBacklogPerInstanceMetricData(calculatedBacklogPerInstance)

    console.log({
        approximateNumberOfMessages,
        runningInstances,
        acceptableBackLogPerInstance: parseInt(process.env.ACCEPTABLE_BACKLOG_PER_INSTANCE),
        calculatedBacklogPerInstance,
        backlogPerInstancePutMetricDataResponse
    })
}

export function getBacklogPerInstance(approximateNumberOfMessages, runningInstances, target) {
    if (approximateNumberOfMessages === 0) {
        return 0
    } else if (approximateNumberOfMessages <= target) {
        if (runningInstances === 0) {
            // trigger a scale-out alarm
            return target + 1
        } else if (runningInstances === 1) {
            // don't trigger a scale-in alarm - keep the current state
            return target
        } else {
            // runningInstances > 1
            // may cause a scale-in alarm
            return approximateNumberOfMessages / runningInstances
        }

    } else {
        // approximateNumberOfMessages > target
        return runningInstances === 0 ? approximateNumberOfMessages : approximateNumberOfMessages / runningInstances
    }
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



