output "aws_sqs_queue_url" {
  value = aws_sqs_queue.queue.url
}

output "aws_region" {
  value = var.AWS_REGION
}