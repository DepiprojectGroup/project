variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "ordering-system"
}

variable "ssh_key_name" {
  description = "SSH key pair name for EC2 instances"
  type        = string
  default     = "youssef"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for private subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "availability_zone" {
  description = "Availability zone for subnets"
  type        = string
  default     = "eu-central-1a"
}

variable "eks_cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "ordering-system-eks-cluster"
}

variable "eks_node_instance_type" {
  description = "Instance type for EKS nodes"
  type        = string
  default     = "t3.small" 
}

variable "eks_desired_capacity" {
  description = "Desired number of EKS nodes"
  type        = number
  default     = 1  
}

variable "eks_min_size" {
  description = "Minimum number of EKS nodes"
  type        = number
  default     = 1
}

variable "eks_max_size" {
  description = "Maximum number of EKS nodes"
  type        = number
  default     = 2 
}

# RDS Database Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"  
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "app_database"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "app_user"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  default     = "changeme123"  # Change this in production!
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20  
}

variable "db_engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.15" 
}
