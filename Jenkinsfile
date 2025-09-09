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
                script {
                    def sastCmd = 'semgrep --config=auto backend frontend || exit 0'
                    def secretsCmd = 'gitleaks detect --source . || exit 0'

                    if (isUnix()) {
                        sh sastCmd
                        sh secretsCmd
                    } else {
                        bat sastCmd
                        bat secretsCmd
                    }
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                script {
                    def depScan = 'npm install && npm audit || exit 0'

                    if (isUnix()) {
                        dir('backend') { sh depScan }
                        dir('frontend') { sh depScan }
                    } else {
                        dir('backend') { bat depScan }
                        dir('frontend') { bat depScan }
                    }
                }
            }
        }

        stage('Container Image Scan') {
            steps {
                script {
                    def trivyCmd = "trivy image ${DOCKER_IMAGE_NAME} || exit 0"

                    if (isUnix()) {
                        sh trivyCmd
                    } else {
                        bat trivyCmd
                    }
                }
            }
        }

        stage('IaC Scan') {
            steps {
                script {
                    def checkovCmd = 'checkov -d . || exit 0'

                    if (isUnix()) {
                        sh checkovCmd
                    } else {
                        bat checkovCmd
                    }
                }
            }
        }

        stage('DAST Scan') {
            steps {
                script {
                    def zapCmd = 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5173 || exit 0'

                    if (isUnix()) {
                        sh zapCmd
                    } else {
                        bat zapCmd
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'

                    if (isUnix()) {
                        sh downCmd
                        sh upCmd
                    } else {
                        bat downCmd
                        bat upCmd
                    }
                }
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
