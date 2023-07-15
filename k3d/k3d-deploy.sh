#!/bin/bash

DOCKER_BUILDKIT=1 docker build -t k3d-registry.localhost:55000/bulby:local ..
docker push k3d-registry.localhost:55000/bulby:local

HELM_REPO_NAME=jameswynn
HELM_REPO_URL=https://jameswynn.github.io/helm-charts

if ! helm repo list | grep $HELM_REPO_URL > /dev/null; then
  helm repo add $HELM_REPO_NAME $HELM_REPO_URL
  helm repo update
fi

helm upgrade --install bulby jameswynn/bulby -f k3d-helm-values.yaml
