resource "aws_autoscaling_policy" "backlog-per-instance-target-tracking-policy" {
  name                      = "backlog-per-instance-target-tracking-policy"
  autoscaling_group_name    = aws_autoscaling_group.sqs_workers_autoscaling_group.name
  policy_type               = "TargetTrackingScaling"
  estimated_instance_warmup = 120
  target_tracking_configuration {
    customized_metric_specification {
      metric_dimension {
        name  = "Project"
        value = "SQSAutoScalingDemo"
      }
      metric_name = "BacklogPerInstance"
      namespace   = "SQS/AutoScaling"
      statistic   = "Average"
      unit        = "None"
    }
    target_value = aws_ssm_parameter.acceptableBacklogPerInstance_aws_ssm_parameter.value
  }
}

resource "aws_autoscaling_policy" "initial-scale-up" {
  autoscaling_group_name = aws_autoscaling_group.sqs_workers_autoscaling_group.name
  name                   = "initial-scale-up-simple-policy"
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 120
  scaling_adjustment     = 1
}

resource "aws_cloudwatch_metric_alarm" "queue-not-empty-and-no-instances" {
  alarm_name          = "queue-not-empty-and-no-instances"
  alarm_description   = "triggered when the number of message in the queue is greater than 0 and there are no instances currently on the ASG"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3
  period              = 60.0
  metric_name         = "InitialStateScaleIndicator"
  namespace           = "SQS/AutoScaling"
  statistic           = "Average"
  threshold           = 1.0
  dimensions          = {
    Project = "SQSAutoScalingDemo"
  }
  alarm_actions       = [aws_autoscaling_policy.initial-scale-up.arn]
}