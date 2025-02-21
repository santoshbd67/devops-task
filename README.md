## Prerequisites

#### Install VSCode Extensions

1.Terraform (by HashiCorp) – Provides syntax highlighting and formatting.

2.AWS Toolkit – Helps with AWS authentication and resource management.

3.Remote - SSH – For SSH access within VSCode (optional).

## Step 1: Setup Terraform Project in VSCode

1.Open VSCode.

2.Create a new folder: terraform-aws-poc.

3.Inside this folder, create the following files:

main.tf
'''
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "data_generate" {
  cidr_block = var.vpc_cidr
  tags = {
    Name = var.vpc_name
  }
}

# Public Subnet
resource "aws_subnet" "data_generate" {
  vpc_id                  = aws_vpc.data_generate.id
  cidr_block              = var.subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.instance_name}-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "data_generate" {
  vpc_id = aws_vpc.data_generate.id
  tags = {
    Name = "${var.instance_name}-igw"
  }
}

# Route Table
resource "aws_route_table" "data_generate" {
  vpc_id = aws_vpc.data_generate.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.data_generate.id
  }

  tags = {
    Name = "${var.instance_name}-rt"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "data_generate" {
  subnet_id      = aws_subnet.data_generate.id
  route_table_id = aws_route_table.data_generate.id
}

# Security Group
resource "aws_security_group" "data_generate" {
  name        = "${var.instance_name}-sg"
  description = "Allow SSH, HTTP, and app port"
  vpc_id      = aws_vpc.data_generate.id

  dynamic "ingress" {
    for_each = var.security_group_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }
}

# EC2 Instance
resource "aws_instance" "data_generate" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.data_generate.id
  vpc_security_group_ids = [aws_security_group.data_generate.id]
  key_name               = var.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = var.volume_size
    volume_type = "gp2"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io openjdk-17-jre wget gnupg

              systemctl start docker
              systemctl enable docker
              ## Install jenkins
              sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \\
                  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
              echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \\
                  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \\
                  /etc/apt/sources.list.d/jenkins.list > /dev/null
              sudo apt-get update
              sudo apt-get install fontconfig openjdk-17-jre -y
              sudo apt-get install jenkins -y

              systemctl start jenkins
              systemctl enable jenkins
              ## Install AWS Cli
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              sudo apt install unzip -y
              unzip awscliv2.zip
              sudo ./aws/install -i /usr/local/aws-cli -b /usr/local/bin --update
              ## Install Kubectl
              curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
              chmod +x ./kubectl
              sudo mv ./kubectl /usr/local/bin
              ## Install Ekctl
              curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
              sudo mv /tmp/eksctl /usr/local/bin
              EOF

  tags = {
    Name = var.instance_name
  }
} 
'''
