# FoodRescue Deployment Guide

## Production Architecture

Single EC2, single Docker network, single public entrypoint:

- `nginx` exposes port `80`
- `frontend` runs Next.js on internal port `3000`
- `backend` runs Spring Boot on internal port `8080`
- `mysql` runs on internal port `3306`

Traffic flow:

- `/` -> Next.js
- `/api/*` -> Spring Boot

## Repository Files

- [docker-compose.yml](d:/FoodRescue/docker-compose.yml): production compose file for EC2
- [nginx/default.conf](d:/FoodRescue/nginx/default.conf): reverse proxy config
- [backend.env.example](d:/FoodRescue/backend.env.example): backend and MySQL host env template
- [frontend.env.example](d:/FoodRescue/frontend.env.example): frontend host env template
- [.deploy.env.example](d:/FoodRescue/.deploy.env.example): image tag template used during deploy
- [foodrescue-be/Dockerfile](d:/FoodRescue/foodrescue-be/Dockerfile): backend image build
- [foodrescue-fe/Dockerfile](d:/FoodRescue/foodrescue-fe/Dockerfile): frontend image build
- [ci-develop.yml](d:/FoodRescue/.github/workflows/ci-develop.yml): CI for `develop`
- [deploy-master.yml](d:/FoodRescue/.github/workflows/deploy-master.yml): build, push, and deploy for `master`

## EC2 Folder Layout

Use this layout on the server:

```text
/opt/foodrescue
  compose.prod.yml
  backend.env
  frontend.env
  .deploy.env
  nginx/
    default.conf
  mysql-backups/
```

## Manual Setup

### 1. Prepare EC2

Open only:

- `22` from your own IP if possible
- `80` from anywhere
- `443` later when you add a domain and TLS

Install Docker:

```sh
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
newgrp docker
docker --version
docker compose version
```

### 2. Create deploy directory

```sh
sudo mkdir -p /opt/foodrescue/nginx /opt/foodrescue/mysql-backups
sudo chown -R ubuntu:ubuntu /opt/foodrescue
```

### 3. Create host env files

Create `/opt/foodrescue/backend.env` from [backend.env.example](d:/FoodRescue/backend.env.example).

The current public IPv4 in your AWS screenshot is `13.250.95.15`, but the instance has no Elastic IP. If you stop/start the instance again, update every IP-based setting and the `EC2_HOST` GitHub secret.

Important values to replace:

- `DB_PASSWORD`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `VERIFICATION_BASE_URL`
- `RESET_PASSWORD_BASE_URL`
- `APP_CORS_ALLOWED_ORIGINS`
- `CLOUDINARY_API_SECRET`

Create `/opt/foodrescue/frontend.env` from [frontend.env.example](d:/FoodRescue/frontend.env.example).

Recommended values:

```env
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=3000
FRONTEND_API_BASE_URL=/api
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Set permissions:

```sh
chmod 600 /opt/foodrescue/backend.env
chmod 600 /opt/foodrescue/frontend.env
```

### 4. First manual deploy

Copy the compose and Nginx files once:

```sh
scp -i your-key.pem docker-compose.yml ubuntu@EC2_PUBLIC_IP:/opt/foodrescue/compose.prod.yml
scp -i your-key.pem nginx/default.conf ubuntu@EC2_PUBLIC_IP:/opt/foodrescue/nginx/default.conf
```

Create initial image tags:

```sh
cat > /opt/foodrescue/.deploy.env <<EOF
BACKEND_IMAGE=your-dockerhub-username/foodrescue-be:latest
FRONTEND_IMAGE=your-dockerhub-username/foodrescue-fe:latest
EOF
```

Run:

```sh
cd /opt/foodrescue
docker compose --env-file .deploy.env -f compose.prod.yml pull
docker compose --env-file .deploy.env -f compose.prod.yml up -d
docker compose --env-file .deploy.env -f compose.prod.yml ps
```

## GitHub Secrets

Add these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_DEPLOY_PATH`

Recommended values:

- `EC2_USER=ubuntu`
- `EC2_DEPLOY_PATH=/opt/foodrescue`

## Branch Strategy

- `feature/*` -> open PR into `develop`
- `develop` -> CI only
- `master` -> build image, push image, deploy EC2
- `hotfix/*` -> patch urgent prod issues, then merge back into both `master` and `develop`

## Deploy Flow

1. Push feature branch.
2. Merge into `develop`.
3. `develop` runs backend test and frontend build.
4. Merge `develop` into `master`.
5. `master` builds both Docker images.
6. Workflow pushes `latest` and `sha-<commit>` tags.
7. Workflow uploads compose and Nginx config to EC2.
8. Workflow writes `.deploy.env` with the new SHA tags.
9. EC2 runs `docker compose pull` and `up -d`.

## Rollback

Inspect previous tags in Docker Hub, then update `/opt/foodrescue/.deploy.env`:

```env
BACKEND_IMAGE=your-dockerhub-username/foodrescue-be:sha-abc1234
FRONTEND_IMAGE=your-dockerhub-username/foodrescue-fe:sha-abc1234
```

Re-run:

```sh
cd /opt/foodrescue
docker compose --env-file .deploy.env -f compose.prod.yml pull
docker compose --env-file .deploy.env -f compose.prod.yml up -d
```

## MySQL Backup

Manual backup:

```sh
mkdir -p /opt/foodrescue/mysql-backups
docker compose --env-file /opt/foodrescue/.deploy.env -f /opt/foodrescue/compose.prod.yml exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --quick --databases "$MYSQL_DATABASE"' > /opt/foodrescue/mysql-backups/foodrescue-$(date +%F-%H%M%S).sql
```

Basic cron at 3 AM daily:

```sh
crontab -e
```

```cron
0 3 * * * docker compose --env-file /opt/foodrescue/.deploy.env -f /opt/foodrescue/compose.prod.yml exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --quick --databases "$MYSQL_DATABASE"' > /opt/foodrescue/mysql-backups/foodrescue-$(date +\%F-\%H\%M\%S).sql
```

## Security Checklist

- Do not commit real `.env` files.
- Rotate old secrets before first production deploy.
- Use long random `JWT_SECRET`.
- Keep MySQL internal only. Do not open `3306`.
- Keep backend internal only. Do not open `8080`.
- Keep frontend internal only. Do not open `3000`.
- Restrict SSH access by source IP if possible.
- Update EC2 packages periodically.
- Review Docker Hub access token scope.
- Use SHA image tags for rollback and traceability.

## Production Checklist

- Backend local build passes.
- Frontend local build passes.
- Docker images build in GitHub Actions.
- `backend.env` exists on EC2.
- `frontend.env` exists on EC2.
- `.deploy.env` exists on EC2.
- `compose.prod.yml` exists on EC2.
- `nginx/default.conf` exists on EC2.
- Docker Hub repos exist.
- GitHub Secrets are configured.
- `http://EC2_PUBLIC_IP` loads frontend.
- `http://EC2_PUBLIC_IP/api/...` reaches backend through Nginx.
