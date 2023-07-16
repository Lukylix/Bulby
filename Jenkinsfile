def app
pipeline {
  agent any
  stages {
    stage("Build") {
      steps {
        script {
          app = docker.build("lukylix/bulby")
        }
      }
    }
    stage("Push Image") {
      steps {
        script{
          docker.withRegistry("https://ghcr.io", "ghcr-auth") {
            app.push("1.0.${env.BUILD_NUMBER}");
            app.push("latest")
          }
        }
      }
    }
  }
}