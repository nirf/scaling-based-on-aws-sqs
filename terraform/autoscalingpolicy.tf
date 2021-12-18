resource "aws_autoscaling_policy" "backlog-per-instance-target-tracking-policy" {
  name                   = "backlog-per-instance-target-tracking-policy"
  autoscaling_group_name = aws_autoscaling_group.sqs_workers_autoscaling_group.name
  policy_type            = "TargetTrackingScaling"
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
    target_value = 10
  }
}

resource "aws_autoscaling_policy" "approximate-number-of-messages-visible-step-scaling-policy-scale-up" {
  autoscaling_group_name = "approximate-number-of-messages-visible-step-scaling-policy-scale-up"
  name                   = aws_autoscaling_group.sqs_workers_autoscaling_group.name
  policy_type = "StepScaling"
  adjustment_type = "ChangeInCapacity"
  estimated_instance_warmup = 120
  step_adjustment {
    scaling_adjustment = 1
    metric_interval_lower_bound = 0.0
    metric_interval_upper_bound = 10.0
  }
}

resource "aws_cloudwatch_metric_alarm" "queue-is-not-empty-cloudwatch-alarm" {
  alarm_name          = "queue-is-not-empty-cloudwatch-alarm"
  alarm_description = "triggered when the number of message in the queue is greater than 0"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  period = 60.0
  metric_name = "ApproximateNumberOfMessagesVisible"
  namespace = "AWS/SQS"
  statistic = "Average"
  threshold = 0.0
  dimensions = {
    QueueName = aws_sqs_queue.queue.name
  }
  alarm_actions = [aws_autoscaling_policy.approximate-number-of-messages-visible-step-scaling-policy-scale-up.arn]
}