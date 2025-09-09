pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
    }

    stages {
        // 1️⃣ Clone Repository
        stage('Clone Repository') {
            steps {
                git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
            }
        }

        // 2️⃣ Write .env
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

        stage('Package Scan') {
    steps {
        script {
            def pkgDir = 'backend' // change to your actual folder containing package.json
            if (isUnix()) {
                sh "cd ${pkgDir} && npm install"
                sh "cd ${pkgDir} && npm audit --audit-level=moderate"
                sh "cd ${pkgDir} && npm outdated || true"
                sh "cd ${pkgDir} && npx snyk test || true"
            } else {
                bat "cd /d ${pkgDir} && npm install"
                bat "cd /d ${pkgDir} && npm audit --audit-level=moderate"
                bat "cd /d ${pkgDir} && npm outdated || exit /b 0"
                bat "cd /d ${pkgDir} && npx snyk test || exit /b 0"
            }
        }
    }
}


        // 4️⃣ Secret Scanning
        stage('Secret Scanning') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx gitleaks detect --source=. --no-git'
                    } else {
                        bat 'npx gitleaks detect --source=. --no-git'
                    }
                }
            }
        }

        // 5️⃣ Static Code Analysis (SAST)
        stage('Static Code Analysis') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx eslint . --ext .js,.jsx --max-warnings=0 || true'
                        sh 'npx semgrep --config=auto .'
                    } else {
                        bat 'npx eslint . --ext .js,.jsx --max-warnings=0 || exit /b 0'
                        bat 'npx semgrep --config=auto .'
                    }
                }
            }
        }

        // 6️⃣ Build & Deploy
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

        // 7️⃣ Container Security Scan
        stage('Container Security Scan') {
            steps {
                script {
                    if (isUnix()) {
                        sh "trivy image ${DOCKER_IMAGE_NAME}:latest"
                        sh "docker scan ${DOCKER_IMAGE_NAME}:latest || true"
                    } else {
                        bat "trivy image ${DOCKER_IMAGE_NAME}:latest"
                        bat "docker scan ${DOCKER_IMAGE_NAME}:latest || exit /b 0"
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
        success {
            echo '🚀 Pipeline completed successfully!'
        }
    }
}
