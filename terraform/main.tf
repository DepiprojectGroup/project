terraform {
required_version = ">= 1.0"

required_providers {
aws = {
source  = "hashicorp/aws"
version = "~> 5.0"
}
}
}

provider "aws" {
region = var.aws_region
}

# ---------------------------

# VPC

# ---------------------------

resource "aws_vpc" "main" {
cidr_block           = var.vpc_cidr
enable_dns_hostnames = true
enable_dns_support   = true

tags = {
Name = "${var.project_name}-vpc"
}
}

# ---------------------------

# Internet Gateway

# ---------------------------

resource "aws_internet_gateway" "main" {
vpc_id = aws_vpc.main.id

tags = {
Name = "${var.project_name}-igw"
}
}

# ---------------------------

# Subnets

# ---------------------------

# Public Subnet 1

resource "aws_subnet" "public" {
vpc_id                  = aws_vpc.main.id
cidr_block              = var.public_subnet_cidr
availability_zone       = var.availability_zone
map_public_ip_on_launch = true

tags = {
Name = "${var.project_name}-public-subnet-1"
"kubernetes.io/role/elb" = "1"
}
}

# Public Subnet 2

resource "aws_subnet" "public_2" {
vpc_id                  = aws_vpc.main.id
cidr_block              = "10.0.4.0/24"
availability_zone       = "${var.aws_region}b"
map_public_ip_on_launch = true

tags = {
Name = "${var.project_name}-public-subnet-2"
"kubernetes.io/role/elb" = "1"
}
}

# Private Subnet 1

resource "aws_subnet" "private" {
vpc_id            = aws_vpc.main.id
cidr_block        = var.private_subnet_cidr
availability_zone = var.availability_zone

tags = {
Name = "${var.project_name}-private-subnet-1"
"kubernetes.io/role/internal-elb" = "1"
}
}

# Private Subnet 2

resource "aws_subnet" "private_2" {
vpc_id            = aws_vpc.main.id
cidr_block        = "10.0.3.0/24"
availability_zone = "${var.aws_region}b"

tags = {
Name = "${var.project_name}-private-subnet-2"
"kubernetes.io/role/internal-elb" = "1"
}
}

# ---------------------------

# NAT Gateway

# ---------------------------

resource "aws_eip" "nat" {
domain = "vpc"

tags = {
Name = "${var.project_name}-nat-eip"
}

depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
allocation_id = aws_eip.nat.id
subnet_id     = aws_subnet.public.id

tags = {
Name = "${var.project_name}-nat-gateway"
}

depends_on = [aws_internet_gateway.main]
}

# ---------------------------

# Route Tables

# ---------------------------

# Public Route Table

resource "aws_route_table" "public" {
vpc_id = aws_vpc.main.id

route {
cidr_block = "0.0.0.0/0"
gateway_id = aws_internet_gateway.main.id
}

tags = {
Name = "${var.project_name}-public-rt"
}
}

# Private Route Table

resource "aws_route_table" "private" {
vpc_id = aws_vpc.main.id

route {
cidr_block     = "0.0.0.0/0"
nat_gateway_id = aws_nat_gateway.main.id
}

tags = {
Name = "${var.project_name}-private-rt"
}
}

# Route Table Associations

resource "aws_route_table_association" "public" {
subnet_id      = aws_subnet.public.id
route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
subnet_id      = aws_subnet.public_2.id
route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
subnet_id      = aws_subnet.private.id
route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
subnet_id      = aws_subnet.private_2.id
route_table_id = aws_route_table.private.id
}

# ---------------------------

# RDS DB Subnet Group

# ---------------------------

resource "aws_db_subnet_group" "main" {
name       = "ordering-system-db-subnet-group"
subnet_ids = [aws_subnet.private.id, aws_subnet.private_2.id]

tags = {
Name = "${var.project_name}-db-subnet-group"
}

lifecycle {
prevent_destroy = false
}
}

# ---------------------------

# EKS Cluster

# ---------------------------

resource "aws_eks_cluster" "main" {
name     = "${var.project_name}-eks-cluster"
role_arn = aws_iam_role.eks_cluster_role.arn
version  = "1.27"

vpc_config {
subnet_ids = [aws_subnet.public.id, aws_subnet.public_2.id]
}

depends_on = [aws_eks_node_group.main]  # يحذف Node Groups قبل الكلاستر
}

# EKS Node Group

resource "aws_eks_node_group" "main" {
cluster_name    = aws_eks_cluster.main.name
node_group_name = "${var.project_name}-nodegroup"
node_role_arn   = aws_iam_role.eks_node_role.arn
subnet_ids      = [aws_subnet.public.id, aws_subnet.public_2.id]

scaling_config {
desired_size = 1
max_size     = 2
min_size     = 1
}
}
