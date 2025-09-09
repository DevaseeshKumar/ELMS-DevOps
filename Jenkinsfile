pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
            }
        }

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

        stage('SAST & Secrets Scan') {
            steps {
                sh 'semgrep --config=auto ./backend ./frontend || true'
                sh 'gitleaks detect --source . || true'
            }
        }

        stage('Dependency Scan') {
            steps {
                dir('backend') { sh 'npm install && npm audit --json || true' }
                dir('frontend') { sh 'npm install && npm audit --json || true' }
            }
        }

        stage('Build & Deploy') {
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

        stage('Container Image Scan') {
            steps {
                sh 'trivy image ${DOCKER_IMAGE_NAME} || true'
            }
        }

        stage('IaC Scan') {
            steps {
                sh 'checkov -d . || true'
            }
        }

        stage('DAST Scan') {
            steps {
                // Assuming app is running after Build & Deploy
                sh 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5173 || true'
            }
        }
    }

    post {
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
    }
}
