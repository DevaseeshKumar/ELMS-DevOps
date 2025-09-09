pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_LOGIN = 'your-sonarqube-token'
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

        stage('Secret Scanning - Gitleaks') {
            steps {
                script {
                    echo '🔒 Running Gitleaks secret scan...'
                    bat "mkdir ${REPORT_DIR} || exit /b 0"
                    bat "gitleaks detect --source . --report-path ${REPORT_DIR}\\gitleaks.json || exit /b 0"
                    bat "gitleaks-to-html -i ${REPORT_DIR}\\gitleaks.json -o ${REPORT_DIR}\\gitleaks.html || exit /b 0"
                }
            }
        }

        stage('Code Security Review - SonarQube') {
            steps {
                script {
                    echo '📝 Running SonarQube scan...'
                    bat """
                    sonar-scanner ^
                      -Dsonar.projectKey=ELMS ^
                      -Dsonar.sources=. ^
                      -Dsonar.host.url=${SONAR_HOST_URL} ^
                      -Dsonar.login=${SONAR_LOGIN}
                    """
                }
            }
        }

        stage('Dependency Scanning - OWASP Dependency-Check') {
            steps {
                script {
                    echo '📦 Running OWASP Dependency-Check...'
                    bat "dependency-check.bat --project ELMS --scan . --format HTML --out ${REPORT_DIR}\\dependency-check.html || exit /b 0"
                }
            }
        }

        stage('Package Scan - Snyk') {
            steps {
                script {
                    echo '📦 Running Snyk scans...'
                    bat "cd /d ${BACKEND_DIR} && npm install"
                    bat "cd /d ${BACKEND_DIR} && npx snyk test --json 1>..\\${REPORT_DIR}\\backend-snyk.json || exit /b 0"
                    bat "cd /d ${FRONTEND_DIR} && npm install"
                    bat "cd /d ${FRONTEND_DIR} && npx snyk test --json 1>..\\${REPORT_DIR}\\frontend-snyk.json || exit /b 0"

                    // Convert JSON to HTML
                    bat "npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html || exit /b 0"
                    bat "npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html || exit /b 0"
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    bat 'docker compose -f docker-compose.yml down || exit 0'
                    bat 'docker compose -f docker-compose.yml up --build -d'
                }
            }
        }

        stage('Container Security Scan - Trivy') {
            steps {
                script {
                    echo '🛡️ Running Trivy container scan...'
                    bat "trivy image -f json -o ${REPORT_DIR}\\trivy-backend.json elms-backend || exit /b 0"
                    bat "trivy image -f json -o ${REPORT_DIR}\\trivy-frontend.json elms-frontend || exit /b 0"
                    bat "trivy-to-html ${REPORT_DIR}\\trivy-backend.json > ${REPORT_DIR}\\trivy-backend.html || exit /b 0"
                    bat "trivy-to-html ${REPORT_DIR}\\trivy-frontend.json > ${REPORT_DIR}\\trivy-frontend.html || exit /b 0"
                }
            }
        }

        stage('Application Runtime Protection - OWASP ZAP') {
            steps {
                script {
                    echo '🌐 Running OWASP ZAP scan (DAST)...'
                    bat "zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:8000 || exit /b 0"
                    bat "zap-cli report -o ${REPORT_DIR}\\zap-report.html -f html || exit /b 0"
                }
            }
        }
    }

    post {
        always {
            echo '📂 Archiving all security reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true
        }
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
