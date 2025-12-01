# Data source for latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance for Nexus
resource "aws_instance" "nexus" {
  ami                    =  data.aws_ami.amazon_linux_2.id  # صح: استخدم data source
  instance_type          = var.nexus_instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.nexus.id]
  key_name               = ""  # تأكد إن key موجود في AWS

  root_block_device {
    volume_size = 8   
    volume_type = "gp2"
  }

  tags = {
    Name = "${var.project_name}-nexus-server"
    Type = "Nexus"
  }
}

# Elastic IP for Nexus (optional but recommended)
resource "aws_eip" "nexus" {
  instance = aws_instance.nexus.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-nexus-eip"
  }

  depends_on = [aws_internet_gateway.main]
}
