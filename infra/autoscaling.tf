resource "aws_launch_configuration" "sqs_workers_launch_configuration" {
  name_prefix   = "sqs_workers_launch_configuration"
  image_id      = var.AMIS[var.AWS_REGION]
  instance_type = "t2.micro"
  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name
  security_groups = [aws_security_group.allow-ssh.id]
  key_name = aws_key_pair.mykeypair.key_name
  user_data = data.template_cloudinit_config.cloudinit-config.rendered
}

resource "aws_autoscaling_group" "sqs_workers_autoscaling_group" {
  name                      = "sqs_workers_autoscaling_group"
  vpc_zone_identifier       = [
    aws_subnet.main-public-1.id
  ]
  launch_configuration      = aws_launch_configuration.sqs_workers_launch_configuration.name
  min_size                  = 1
  max_size                  = 10
  health_check_grace_period = 120
  health_check_type         = "EC2"
  force_delete              = true

  tag {
    key                 = "Name"
    value               = "ec2 instance sqs worker"
    propagate_at_launch = true
  }
}