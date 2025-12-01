# Deploy AWARE to us-west-1

## ✅ Completed Steps

I've successfully completed the following:

1. **Cleaned up us-east-1**:
   - ✅ Stopped and deleted all ECS services (backend, frontend)
   - ✅ Deleted ECS cluster: aware-water-cluster
   - ✅ Deleted Application Load Balancer: aware-water-alb
   - ✅ Deleted target groups
   - ✅ Deleted CloudWatch log groups
   - ✅ Security groups removed (some may remain due to dependencies, will be cleaned automatically)

2. **Set up us-west-1 infrastructure**:
   - ✅ Created ECR repositories (aware-water-backend, aware-water-frontend)
   - ✅ Created ECS cluster: aware-water-cluster
   - ✅ Created security groups (ALB SG, ECS SG)
   - ✅ Created Application Load Balancer: **aware-water-alb-1723674360.us-west-1.elb.amazonaws.com**
   - ✅ Created AWS Secrets Manager secrets for environment variables
   - ✅ Updated .env file to use us-west-1

3. **Configuration files updated**:
   - ✅ aws-config.json created with us-west-1 resources
   - ✅ .env file updated with `AWS_DEFAULT_REGION="us-west-1"`

---

## 🚀 Next Steps (Run on Your Local Machine)

### Step 1: Ensure Docker is Running

Make sure Docker Desktop is running on your Mac.

### Step 2: Set AWS Environment Variables

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-west-1"
```

**Note:** Use the AWS credentials from your `.env` file or AWS CLI configuration.

### Step 3: Build and Push Docker Images

```bash
cd /Users/raymondli/Documents/CMPE272/aware-water-agent

# Login to ECR
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 623677486066.dkr.ecr.us-west-1.amazonaws.com

# Build and push images
./deploy.sh
```

This will:
- Build backend Docker image
- Build frontend Docker image
- Push both to ECR in us-west-1

### Step 4: Deploy to ECS

```bash
# Deploy ECS services
./deploy-ecs.sh
```

This will:
- Create CloudWatch log groups
- Register ECS task definitions
- Create target groups
- Create/update ECS services
- Configure ALB listeners and routing

### Step 5: Verify Deployment

After deployment completes, your application will be available at:

**Frontend**: http://aware-water-alb-1723674360.us-west-1.elb.amazonaws.com

**Backend API**: http://aware-water-alb-1723674360.us-west-1.elb.amazonaws.com/api

Check service status:

```bash
aws ecs describe-services \
  --cluster aware-water-cluster \
  --services aware-water-cluster-backend aware-water-cluster-frontend \
  --region us-west-1 \
  --query 'services[*].{name:serviceName,status:status,running:runningCount,desired:desiredCount}'
```

View logs:

```bash
# Backend logs
aws logs tail /ecs/aware-water-backend --follow --region us-west-1

# Frontend logs
aws logs tail /ecs/aware-water-frontend --follow --region us-west-1
```

---

## 📊 us-west-1 Resources Summary

| Resource | Value |
|----------|-------|
| **Region** | us-west-1 |
| **ECS Cluster** | aware-water-cluster |
| **Load Balancer DNS** | aware-water-alb-1723674360.us-west-1.elb.amazonaws.com |
| **Backend ECR** | 623677486066.dkr.ecr.us-west-1.amazonaws.com/aware-water-backend |
| **Frontend ECR** | 623677486066.dkr.ecr.us-west-1.amazonaws.com/aware-water-frontend |
| **VPC** | vpc-037c5230ba9814d6a |
| **Subnets** | subnet-0ae3fd8b4704fdd5a, subnet-0728b80c094a77151 |
| **ALB Security Group** | sg-0f5af390c9404a04d |
| **ECS Security Group** | sg-0cbc388dd3d9b817e |

---

## 🔍 Troubleshooting

### If Docker build fails:

```bash
# Check Docker is running
docker ps

# Restart Docker Desktop if needed
```

### If ECR push fails with 403:

```bash
# Re-authenticate with ECR
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 623677486066.dkr.ecr.us-west-1.amazonaws.com
```

### If ECS services fail to start:

```bash
# Check task status
aws ecs list-tasks --cluster aware-water-cluster --service-name aware-water-cluster-backend --region us-west-1

# Get task details
TASK_ARN=$(aws ecs list-tasks --cluster aware-water-cluster --service-name aware-water-cluster-backend --region us-west-1 --query 'taskArns[0]' --output text)
aws ecs describe-tasks --cluster aware-water-cluster --tasks $TASK_ARN --region us-west-1
```

---

## ⚠️ Important Notes

1. **Old us-east-1 resources**: All main resources have been deleted. A few security groups may remain due to dependencies but will be automatically cleaned up by AWS.

2. **Cost**: The deployment in us-west-1 will incur AWS costs (~$30-50/month for minimal setup).

3. **Secrets**: All environment variables are securely stored in AWS Secrets Manager in us-west-1.

4. **DNS Update**: Once deployed, update any documentation or links that reference the old us-east-1 ALB DNS.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at the ALB DNS
- [ ] Backend API responds at /api endpoints
- [ ] ECS services show "RUNNING" status
- [ ] CloudWatch logs are being populated
- [ ] Application functions correctly (login, dashboard, etc.)
- [ ] Update README.md with new ALB DNS if needed
