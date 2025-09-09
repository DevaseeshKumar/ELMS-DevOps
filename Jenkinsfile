pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
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

        stage('Package Scan - Backend') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "cd /d ${env.BACKEND_DIR} && npm install"
                        bat "cd /d ${env.BACKEND_DIR} && npm audit --audit-level=moderate || exit /b 0"
                    } else {
                        sh "cd ${env.BACKEND_DIR} && npm install"
                        sh "cd ${env.BACKEND_DIR} && npm audit --audit-level=moderate || true"
                    }
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "cd /d ${env.FRONTEND_DIR} && npm install"
                        bat "cd /d ${env.FRONTEND_DIR} && npm audit --audit-level=moderate || exit /b 0"
                    } else {
                        sh "cd ${env.FRONTEND_DIR} && npm install"
                        sh "cd ${env.FRONTEND_DIR} && npm audit --audit-level=moderate || true"
                    }
                }
            }
        }

        stage('Secret Scanning') {
            steps {
                echo '🔒 Secret scanning step placeholder (implement your scanning tool here)'
            }
        }

        stage('Static Code Analysis') {
            steps {
                echo '📝 Static code analysis step placeholder (implement your linter or SonarQube scan here)'
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    def isWindows = !isUnix()
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

        stage('Container Security Scan') {
            steps {
                echo '🛡️ Container security scan placeholder (implement Trivy/Clair scan here)'
            }
        }
    }

    post {
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
