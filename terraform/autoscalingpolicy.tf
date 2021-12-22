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
    target_value = 10
  }
}