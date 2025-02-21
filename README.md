## Prerequisites

#### Install VSCode Extensions

1.Terraform (by HashiCorp) – Provides syntax highlighting and formatting.

2.AWS Toolkit – Helps with AWS authentication and resource management.

3.Remote - SSH – For SSH access within VSCode (optional).

## Infrastructure setup

1.Open VSCode.

2.Create a new folder: terraform-aws-poc.

3.Clone the repository in vscode
```
  git clone https://github.com/santoshbd67/infrastructure.git
```
4.Run 
```
terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

  ## Application Frontend and Backend Setup
Note: I manually deployed a sample Node.js application on my local machine to build the source code. After that, I created a GitHub repository containing the source code for both the frontend and backend. This repository was then used for building and deploying the application on AWS EKS. Additionally, I integrated a Jenkins pipeline for automating the build and deployment process.


