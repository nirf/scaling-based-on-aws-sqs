data "template_file" "init-script" {
  template = file("scripts/init.cfg")
  vars     = {
    AWS_REGION = var.AWS_REGION
    QUEUE_URL = aws_sqs_queue.queue.url
  }
}

data "template_cloudinit_config" "cloudinit-config" {
  gzip          = false
  base64_encode = false
  part {
    filename = "init.cfg"
    content_type = "text/cloud-config"
    content = data.template_file.init-script.rendered
  }
}