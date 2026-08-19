# Deployment Guide

## Local (Desarrollo)

```bash
npm run dev -- -p 4310
# http://localhost:4310
```

## Docker (Cualquier servidor)

### Build local
```bash
docker build -t radar-eventos .
docker run -p 3000:3000 radar-eventos
# http://localhost:3000
```

### Con docker-compose
```bash
docker-compose up -d
# http://localhost:3000
```

### Push a un registry
```bash
docker tag radar-eventos myregistry/radar-eventos:latest
docker push myregistry/radar-eventos:latest
```

## Vercel (Serverless, gratis)

```bash
npm i -g vercel
vercel
# Sigue los prompts, elige Next.js como framework
```

O conecta GitHub:
1. Pushea el repo a GitHub
2. Importa en vercel.com
3. Elige Next.js, Next.js usa Next.config.js automáticamente
4. Deploy en segundos

## AWS (ECS + ALB)

```bash
# Push a ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag radar-eventos <account>.dkr.ecr.us-east-1.amazonaws.com/radar-eventos:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/radar-eventos:latest

# ECS task definition
# → use the image URL arriba
# → expose puerto 3000
# → ALB apunta a ECS → http://tu-alb.us-east-1.elb.amazonaws.com
```

## Google Cloud Run

```bash
gcloud run deploy radar-eventos \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Heroku (deprecated pero documentado)

El Dockerfile funciona; Heroku lee Procfile:

```
web: npm run start
```

```bash
heroku create radar-eventos
heroku container:push web
heroku container:release web
```

## Oracle Cloud Free Tier

1. Crea una instancia Linux gratis (ARM64, siempre activa)
2. `ssh` e instala Docker
3. `git clone` + `docker-compose up -d`
4. Configura NGINX como reverse proxy en el puerto 80

## Railway (muy fácil)

1. Railway.app → New Project
2. Deploy from GitHub (conecta tu repo)
3. Elige Node.js
4. Railway detecta Next.js automáticamente
5. Listo en 2 min

---

**La verdad simple:** Este proyecto no corre sin un servidor porque usa `new Date()` para calcular urgencias. "HTML puro" significaría congelar las fechas, lo que destruye el valor.

Cualquiera de estos deployments (excepto HTML puro) mantiene la lógica dinámica y es gratis o casi gratis.
