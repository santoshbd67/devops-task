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

## Installed Jenkins and Integrated with Tools
The Terraform code mentioned in the Infrastructure Setup section installs Jenkins while deploying the infrastructure. After deployment, I connected to the Jenkins server, installed the required plugins, and integrated the necessary tools. Additionally, I added the required credentials for the Jenkins pipeline and created a CI job in Jenkins, which was then successfully built.

 Jenkinsfile (jenkins pipeline for the CI)
 ```
pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1" // Set your AWS region
        AWS_ACCOUNT_ID = "905418309961" // Replace with your AWS Account ID

        ECR_BACKEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dummy-backend"
        ECR_FRONTEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dummy-frontend"
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/santoshbd67/devops-task.git'
            }
        }

        stage('AWS ECR Login') {
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                        sh """
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                        """
                    }
                }
            }
        }

        stage('Build & Push Backend Docker Image') {
            steps {
                script {
                    echo "Building and pushing backend Docker image..."
                    sh """
                        cd backend
                        docker build -t ${ECR_BACKEND_REPO}:latest .
                        docker push ${ECR_BACKEND_REPO}:latest
                    """
                }
            }
        }

        stage('Build & Push Frontend Docker Image') {
            steps {
                script {
                    echo "Building and pushing frontend Docker image..."
                    sh """
                        cd frontend
                        docker build -t ${ECR_FRONTEND_REPO}:latest .
                        docker push ${ECR_FRONTEND_REPO}:latest
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Docker images pushed to AWS ECR successfully!"
        }
        failure {
            echo "Docker image push failed!"
        }
    }
}
```


<img width="944" alt="devops taks CI" src="https://github.com/user-attachments/assets/64ba5110-3ff2-40fb-8c8d-5e9160f5309b" />

## Deploy the Application on EKS

Created deployment and service file for both Frontend and Backend

Frontend
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dummy-data-ui
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dummy-data-ui
  template:
    metadata:
      labels:
        app: dummy-data-ui
    spec:
      containers:
        - name: dummy-data-ui
          image: <your-ecr-uri>/dummy-data-ui:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: dummy-data-ui-service
spec:
  selector:
    app: dummy-data-ui
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

Backend
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dummy-data-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dummy-data-api
  template:
    metadata:
      labels:
        app: dummy-data-api
    spec:
      containers:
        - name: dummy-data-api
          image: <your-ecr-uri>/dummy-data-api:latest
          ports:
            - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: dummy-data-api-service
spec:
  selector:
    app: dummy-data-api
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: ClusterIP
```

### Run the following commands to deploy the application
```
kubectl apply -f frontend-deploy.yml
kubectl apply -f backend-deploy.yml
kubectl get svc
```

Get the external ip of loadbalancer and access the application


<img width="951" alt="task2" src="https://github.com/user-attachments/assets/02a0bdd0-e6db-416f-ace5-436cda65f339" />

<img width="950" alt="taks3" src="https://github.com/user-attachments/assets/29b039b2-93c5-496d-8b07-3a70ae813801" />


## Gitgub Repo
Github repo for application
```
https://github.com/santoshbd67/devops-task.git
```
Github for infrastructure
```
https://github.com/santoshbd67/infrastructure.git
```
Github for EKS creation
```
https://github.com/santoshbd67/Terraform_eks.git
```



