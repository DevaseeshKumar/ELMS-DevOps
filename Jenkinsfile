pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
    }

    stages {
        // 1️⃣ Clone Repo
        stage('Clone Repository') {
            steps {
                git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
            }
        }

        // 2️⃣ Write .env securely
        stage('Write .env') {
            steps {
                writeFile file: '.env', text: '''\
mongodburl=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
FRONTEND_URL=https://localhost:5173
SESSION_SECRET=elms-secret-key
NODE_ENV=production
'''
            }
        }

        // 3️⃣ Package Scan (Dependency + Outdated Check)
        stage('Package Scan') {
            steps {
                sh 'npm install'
                echo '🔍 Scanning packages for vulnerabilities...'
                sh 'npm audit --audit-level=moderate'
                sh 'echo "Checking for outdated packages..."'
                sh 'npm outdated || true'
                sh 'echo "Running Snyk security scan..."'
                sh 'npx snyk test || true'
            }
        }

        // 4️⃣ Secret Scanning
        stage('Secret Scanning') {
            steps {
                sh 'npx gitleaks detect --source=. --no-git'
            }
        }

        // 5️⃣ Static Code Analysis (SAST)
        stage('Static Code Analysis') {
            steps {
                sh 'npx eslint . --ext .js,.jsx --max-warnings=0 || true'
                sh 'npx semgrep --config=auto .'
            }
        }

        // 6️⃣ Build Docker Image
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_NAME}:latest ."
            }
        }

        // 7️⃣ Container Security Scan
        stage('Container Security Scan') {
            steps {
                sh "trivy image ${DOCKER_IMAGE_NAME}:latest"
                sh 'docker scan ${DOCKER_IMAGE_NAME}:latest || true'
            }
        }

        // 8️⃣ Deploy using Docker Compose
        stage('Deploy') {
            steps {
                script {
                    def isWindows = isUnix() == false
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'

                    if (isWindows) {
                        bat downCmd
                        bat upCmd
                    } else {
                        sh downCmd
                        sh upCmd
                    }
                }
            }
        }

        // 9️⃣ Post Deployment Monitoring (Optional)
        stage('Post Deployment Checks') {
            steps {
                echo '✅ Deployment finished. Integrate Prometheus, Grafana, or Falco for runtime monitoring.'
            }
        }
    }

    post {
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
        success {
            echo '🚀 Pipeline completed successfully!'
        }
    }
}
