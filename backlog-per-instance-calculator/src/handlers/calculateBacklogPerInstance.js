import AWS from 'aws-sdk'

const sqs = new AWS.SQS()
const autoScaling = new AWS.AutoScaling()
const cloudWatch = new AWS.CloudWatch()

async function calculateBacklogPerInstance(event, context) {
    const approximateNumberOfMessage = await getApproximateNumberOfMessages(process.env.QUEUE_URL)
    const runningInstances = await getRunningInstances(process.env.ASG_NAME)
    const metricValues = calculateMetricValues(approximateNumberOfMessage, runningInstances, parseInt(process.env.ACCEPTABLE_BACKLOG_PER_INSTANCE))
    const backlogPerInstancePutMetricDataResponse = await putBacklogPerInstanceMetricData(metricValues.backlogPerInstance)
    const initialStateScaleIndicatorPutMetricDataResponse = await putInitialStateScaleIndicatorMetricData(metricValues.initialStateScaleIndicator)

    console.log({
        metricValues,
        approximateNumberOfMessage,
        runningInstances,
        acceptableBackLogPerInstance: parseInt(process.env.ACCEPTABLE_BACKLOG_PER_INSTANCE),
        backlogPerInstancePutMetricDataResponse,
        initialStateScaleIndicatorPutMetricDataResponse
    })
}

function calculateMetricValues(approximateNumberOfMessage, runningInstances, target) {
    if (approximateNumberOfMessage === 0) {
        // in case there are no messages in the queue we need to scale-in
        // target tracking scaling policy will do it
        return {backlogPerInstance: 0, initialStateScaleIndicator: 0}
    } else {
        // approximateNumberOfMessage > 0
        if (runningInstances === 0) {
            // in case we have messages in the queue but no instances we need to scale-out
            // simple scaling policy will do it
            return {backlogPerInstance: target, initialStateScaleIndicator: approximateNumberOfMessage}
        } else {
            // runningInstances > 0
            if (approximateNumberOfMessage <= target) {
                return {backlogPerInstance: target, initialStateScaleIndicator: 0}
            } else {
                // approximateNumberOfMessage > target
                return {
                    backlogPerInstance: approximateNumberOfMessage / runningInstances,
                    initialStateScaleIndicator: 0
                }
            }
        }
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

function putInitialStateScaleIndicatorMetricData(initialStateScaleIndicator) {
    return cloudWatch.putMetricData({
        MetricData: [
            {
                MetricName: 'InitialStateScaleIndicator',
                Dimensions: [
                    {
                        Name: 'Project',
                        Value: 'SQSAutoScalingDemo'
                    }
                ],
                Unit: 'None',
                Value: initialStateScaleIndicator,
            }
        ],
        Namespace: 'SQS/AutoScaling',
    }).promise();
}

export const handler = calculateBacklogPerInstance



