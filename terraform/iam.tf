resource "aws_iam_role" "sqs_role" {
  name = "sqs_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
  tags               = {
    tag-key = "sqs-worker-role"
  }
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ec2_instance_profile_sqs_worker"
  role = aws_iam_role.sqs_role.name
}

resource "aws_iam_role_policy" "sqs_policy" {
  name = "test_policy"
  role = aws_iam_role.sqs_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage"
      ],
      "Effect": "Allow",
      "Resource": "${aws_sqs_queue.queue.arn}"
    }
  ]
}
EOF
}