resource "aws_ssm_parameter" "queueUrl_aws_ssm_parameter" {
  name  = "/sqsAutoscaling/queueUrl"
  type  = "String"
  value = aws_sqs_queue.queue.url
}

resource "aws_ssm_parameter" "queueArn_aws_ssm_parameter" {
  name  = "/sqsAutoscaling/queueArn"
  type  = "String"
  value = aws_sqs_queue.queue.arn
}

resource "aws_ssm_parameter" "autoScalingGroupName_aws_ssm_parameter" {
  name  = "/sqsAutoscaling/autoScalingGroupName"
  type  = "String"
  value = aws_autoscaling_group.sqs_workers_autoscaling_group.name
}